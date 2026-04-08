import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { getGoogleLoginUrl, isGoogleAuthEnabled } from "../services/authService";

/* ────────────────────────────────────────────────────────────────────
   Shared small components
──────────────────────────────────────────────────────────────────── */
function InputField({ label, type = "text", value, onChange, placeholder, error, autoComplete, showToggle, id }) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
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
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:ring-2 ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
              : "border-slate-200 bg-white focus:border-emerald-400 focus:ring-emerald-100"
          }`}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
      {error && <p className="text-xs text-red-600">{error}</p>}
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
  const color = ["bg-red-400", "bg-amber-400", "bg-emerald-400"][score - 1] || "bg-slate-200";
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span key={c.label} className={`text-[11px] font-medium ${c.ok ? "text-emerald-600" : "text-slate-400"}`}>
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Alert({ type, message }) {
  if (!message) return null;
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
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

  const [googleEnabled, setGoogleEnabled] = useState(false);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [alert, setAlert]       = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    let alive = true;
    isGoogleAuthEnabled()
      .then((ok) => { if (alive) setGoogleEnabled(ok); })
      .catch(() => { if (alive) setGoogleEnabled(false); });
    return () => { alive = false; };
  }, []);

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
      <Alert {...(alert || {})} />

      <InputField id="si-email"    label="Email address" type="email"    value={email}    onChange={setEmail}    placeholder="you@example.com" autoComplete="email"           error={errors.email} />
      <InputField id="si-password" label="Password"      type="password" value={password} onChange={setPassword} placeholder="Your password"    autoComplete="current-password" error={errors.password} showToggle />

      <div className="flex items-center justify-between">
        <span />
        <button type="button" onClick={onForgot} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">
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

      {/* Google sign-in placeholder */}
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        disabled={!googleEnabled}
        onClick={() => {
          if (!googleEnabled) return;
          // Redirect to backend OAuth2 login; backend will set session cookie and redirect back.
          window.location.assign(getGoogleLoginUrl());
        }}
        className={`flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold shadow-sm transition ${
          googleEnabled
            ? "bg-white text-slate-700 hover:bg-slate-50"
            : "cursor-not-allowed bg-slate-50 text-slate-400"
        }`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {googleEnabled ? "Continue with Google" : "Google sign-in not configured"}
      </button>

      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-emerald-600 hover:text-emerald-800">
          Sign up
        </button>
      </p>

      {/* Demo hint */}
      <details className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
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

      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-emerald-600 hover:text-emerald-800">
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
        <p className="text-sm text-slate-600">
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

      <button type="button" onClick={onBack} className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Logo / brand */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-sm">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {view === VIEWS.SIGNIN  && "Sign in to PAF"}
              {view === VIEWS.SIGNUP  && "Create your account"}
              {view === VIEWS.FORGOT  && "Reset your password"}
              {view === VIEWS.RESET   && "Choose a new password"}
              {view === VIEWS.SUCCESS && "Password reset!"}
            </h1>
            {view === VIEWS.RESET && resetCtx && (
              <p className="mt-1 text-xs text-slate-500">For <strong>{resetCtx.email}</strong></p>
            )}
          </div>

          {/* Tabs (sign-in / sign-up only) */}
          {(view === VIEWS.SIGNIN || view === VIEWS.SIGNUP) && (
            <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {[VIEWS.SIGNIN, VIEWS.SIGNUP].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                    view === v ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
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
              <p className="text-sm text-slate-600">Your password has been reset. You can now sign in with your new password.</p>
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
        <p className="mt-4 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-700">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
