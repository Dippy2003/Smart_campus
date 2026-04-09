import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

/* ────────────────────────────────────────────────────────────────────
   Shared small components
──────────────────────────────────────────────────────────────────── */
function InputField({ label, type = "text", value, onChange, placeholder, error, autoComplete, showToggle, id }) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 shadow-sm outline-none transition focus:ring-2 ${
            error
              ? "border-red-500/60 bg-red-950/30 focus:border-red-400 focus:ring-red-500/20"
              : "border-slate-600 bg-slate-800/90 focus:border-emerald-400 focus:ring-emerald-500/20"
          }`}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              /* Eye-off icon */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              /* Eye icon */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const color = ["bg-red-400", "bg-amber-400", "bg-emerald-400"][score - 1] || "bg-slate-700";
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : "bg-slate-700"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span key={c.label} className={`text-[11px] font-medium ${c.ok ? "text-emerald-300" : "text-slate-500"}`}>
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Alert({ type, message }) {
  if (!message) return null;
  const styles =
    type === "error"
      ? "border-red-500/50 bg-red-950/30 text-red-200"
      : type === "warning"
        ? "border-amber-500/50 bg-amber-950/30 text-amber-100"
        : "border-emerald-500/50 bg-emerald-950/30 text-emerald-200";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {message}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Sign-In form
──────────────────────────────────────────────────────────────────── */
function SignInForm({ onForgot, onSwitch }) {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [alert, setAlert]       = useState(null);
  const [sessionNotice, setSessionNotice] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      setSessionNotice(
        "Your session expired after 30 minutes of inactivity. Please sign in again."
      );
      const next = new URLSearchParams(searchParams);
      next.delete("session");
      navigate({ search: next.toString() ? `?${next}` : "" }, { replace: true });
    }
  }, [searchParams, navigate]);

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (!password)        e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setLoading(true);
    setAlert(null);
    await new Promise((r) => setTimeout(r, 400));
    const result = await login({ email, password });
    setLoading(false);

    if (!result.success) {
      setAlert({ type: "error", message: result.message });
      return;
    }

    const from = searchParams.get("from") || (result.role === "ADMIN" ? "/admin/dashboard" : "/");
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {sessionNotice && <Alert type="warning" message={sessionNotice} />}
      <Alert {...(alert || {})} />

      <InputField id="si-email"    label="Email address" type="email"    value={email}    onChange={setEmail}    placeholder="you@example.com" autoComplete="email"           error={errors.email} />
      <InputField id="si-password" label="Password"      type="password" value={password} onChange={setPassword} placeholder="Your password"    autoComplete="current-password" error={errors.password} showToggle />

      <div className="flex items-center justify-between">
        <span />
        <button type="button" onClick={onForgot} className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-emerald-300 hover:text-emerald-200">
          Sign up
        </button>
      </p>

      {/* Demo hint */}
      <details className="rounded-xl border border-dashed border-slate-600 p-3 text-xs text-slate-400">
        <summary className="cursor-pointer font-semibold">Demo credentials</summary>
        <div className="mt-2 space-y-0.5">
          <p>Admin: <code>admin@paf.com</code> / <code>Admin123</code></p>
          <p>Tech:  <code>tech@paf.com</code>  / <code>Tech1234</code></p>
          <p>User:  <code>student@paf.com</code>/ <code>Student1A</code></p>
        </div>
      </details>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Sign-Up form
──────────────────────────────────────────────────────────────────── */
function SignUpForm({ onSwitch }) {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [errors, setErrors]     = useState({});
  const [alert, setAlert]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim())  e.name = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = "Enter a valid email address (e.g. user@example.com).";
    if (!password)     e.password = "Password is required.";
    else if (password.length < 8)     e.password = "Must be at least 8 characters.";
    else if (!/[A-Z]/.test(password)) e.password = "Must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(password)) e.password = "Must contain at least one number.";
    if (confirm !== password) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setAlert(null);
    await new Promise((r) => setTimeout(r, 400));
    const result = await register({ name, email, password });
    setLoading(false);

    if (!result.success) { setAlert({ type: "error", message: result.message }); return; }
    navigate("/", { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Alert {...(alert || {})} />

      <InputField id="su-name"     label="Full name"        value={name}     onChange={setName}     placeholder="Jane Smith"        autoComplete="name"             error={errors.name} />
      <InputField id="su-email"    label="Email address"    type="email" value={email}    onChange={setEmail}    placeholder="you@example.com"   autoComplete="email"            error={errors.email} />
      <div className="space-y-2">
        <InputField id="su-password" label="Password"       type="password" value={password} onChange={setPassword} placeholder="Create a password" autoComplete="new-password" error={errors.password} showToggle />
        <PasswordStrength password={password} />
      </div>
      <InputField id="su-confirm"  label="Confirm password" type="password" value={confirm}  onChange={setConfirm}  placeholder="Repeat your password" autoComplete="new-password" error={errors.confirm} showToggle />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-slate-400">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-emerald-300 hover:text-emerald-200">
          Sign in
        </button>
      </p>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Forgot-Password form
──────────────────────────────────────────────────────────────────── */
function ForgotPasswordForm({ onBack, onSent }) {
  const { forgotPassword } = useAuth();

  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setError("Enter a valid email address."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = forgotPassword({ email });
    setLoading(false);

    // Always show success for security (don't reveal if email exists)
    onSent({ email, token: result.token });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <p className="text-sm text-slate-400">
          Enter your registered email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <InputField id="fp-email" label="Email address" type="email" value={email} onChange={(v) => { setEmail(v); setError(""); }} placeholder="you@example.com" autoComplete="email" error={error} />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>

      <button type="button" onClick={onBack} className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200">
        ← Back to sign in
      </button>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Reset-Password form (shown after email is "sent")
──────────────────────────────────────────────────────────────────── */
function ResetPasswordForm({ email, token, onDone }) {
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [errors, setErrors]     = useState({});
  const [alert, setAlert]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!password)                    e.password = "Password is required.";
    else if (password.length < 8)     e.password = "Must be at least 8 characters.";
    else if (!/[A-Z]/.test(password)) e.password = "Must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(password)) e.password = "Must contain at least one number.";
    if (confirm !== password)         e.confirm  = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = resetPassword({ email, token, newPassword: password });
    setLoading(false);

    if (!result.success) { setAlert({ type: "error", message: result.message }); return; }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Alert {...(alert || {})} />

      <div className="space-y-2">
        <InputField id="rp-password" label="New password"     type="password" value={password} onChange={setPassword} placeholder="Create new password" autoComplete="new-password" error={errors.password} showToggle />
        <PasswordStrength password={password} />
      </div>
      <InputField   id="rp-confirm"  label="Confirm password" type="password" value={confirm}  onChange={setConfirm}  placeholder="Repeat new password" autoComplete="new-password" error={errors.confirm}  showToggle />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Reset password"}
      </button>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Main LoginPage – tab controller
──────────────────────────────────────────────────────────────────── */
const VIEWS = {
  SIGNIN:  "signin",
  SIGNUP:  "signup",
  FORGOT:  "forgot",
  RESET:   "reset",
  SUCCESS: "success",
};

export default function LoginPage() {
  const [view, setView]         = useState(VIEWS.SIGNIN);
  const [resetCtx, setResetCtx] = useState(null); // { email, token }

  const handleForgotSent = (ctx) => { setResetCtx(ctx); setView(VIEWS.RESET); };
  const handleResetDone  = ()    => setView(VIEWS.SUCCESS);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-lg shadow-slate-950/60">
          {/* Logo / brand */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-sm">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">
              {view === VIEWS.SIGNIN  && "Sign in to PAF"}
              {view === VIEWS.SIGNUP  && "Create your account"}
              {view === VIEWS.FORGOT  && "Reset your password"}
              {view === VIEWS.RESET   && "Choose a new password"}
              {view === VIEWS.SUCCESS && "Password reset!"}
            </h1>
            {view === VIEWS.RESET && resetCtx && (
              <p className="mt-1 text-xs text-slate-400">For <strong className="text-slate-200">{resetCtx.email}</strong></p>
            )}
          </div>

          {/* Tabs (sign-in / sign-up only) */}
          {(view === VIEWS.SIGNIN || view === VIEWS.SIGNUP) && (
            <div className="mb-6 flex rounded-xl border border-slate-700 bg-slate-800/70 p-1">
              {[VIEWS.SIGNIN, VIEWS.SIGNUP].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                    view === v ? "bg-slate-700 text-emerald-300 shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {v === VIEWS.SIGNIN ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>
          )}

          {/* Active form */}
          {view === VIEWS.SIGNIN  && <SignInForm onForgot={() => setView(VIEWS.FORGOT)} onSwitch={() => setView(VIEWS.SIGNUP)} />}
          {view === VIEWS.SIGNUP  && <SignUpForm onSwitch={() => setView(VIEWS.SIGNIN)} />}
          {view === VIEWS.FORGOT  && <ForgotPasswordForm onBack={() => setView(VIEWS.SIGNIN)} onSent={handleForgotSent} />}
          {view === VIEWS.RESET   && resetCtx && <ResetPasswordForm email={resetCtx.email} token={resetCtx.token} onDone={handleResetDone} />}

          {view === VIEWS.SUCCESS && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl">✅</div>
              <p className="text-sm text-slate-300">Your password has been reset. You can now sign in with your new password.</p>
              <button
                onClick={() => setView(VIEWS.SIGNIN)}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>

        {/* Back home */}
        <p className="mt-4 text-center text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-200">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
