import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "../../features/member4-auth/Contexts/AuthContext";
import NotificationBell from "../../features/member4-auth/components/NotificationBell";

function isRenderableType(t) {
  if (!t) return false;
  const typ = typeof t;
  if (typ === "function") return true;
  if (typ === "object" && t.$$typeof) return true;
  return false;
}

const NotificationBellSafe = isRenderableType(NotificationBell)
  ? NotificationBell
  : () => null;
function pathToNavId(pathname) {
  if (pathname.startsWith("/resources")) return "resources";
  if (pathname.startsWith("/bookings")) return "bookings";
  if (pathname.startsWith("/incidents")) return "incidents";
  if (pathname.startsWith("/dashboard")) return "home";
  if (pathname.startsWith("/admin")) return "home";
  if (pathname.startsWith("/member")) return "home";
  return "home";
}

export default function PillNavbar() {
  const { isAdmin, isTechnician, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const isLanding = location.pathname === "/";
  const profileMenuRef = useRef(null);

  const dashboardTo = isAdmin ? "/admin/dashboard" : isTechnician ? "/incidents/admin" : "/dashboard";

  const activeId = useMemo(() => {
    if (isLanding) {
      const h = (location.hash || "").toLowerCase();
      if (h === "#features") return "features";
      if (h === "#about") return "about";
      if (h === "#contact") return "contact";
      return "home";
    }
    return pathToNavId(location.pathname);
  }, [isLanding, location.hash, location.pathname]);

  const routeItems = useMemo(
    () => {
      const base = [
        { id: "home", to: "/", label: "Home", end: true, type: "route" },
        { id: "resources", to: "/resources", label: "Resources", end: false, type: "route" },
      ];
      // Admin / technician portal: keep main nav minimal (no bookings & incidents shortcuts).
      if (isAdmin || isTechnician) return base;
      return [
        ...base,
        { id: "bookings", to: "/bookings", label: "Bookings", end: false, type: "route" },
        { id: "incidents", to: "/incidents", label: "Incidents", end: false, type: "route" },
      ];
    },
    [isAdmin, isTechnician]
  );

  const anchorItems = useMemo(
    () => [
      { id: "features", href: "#features", label: "Features", type: "anchor" },
      { id: "about", href: "#about", label: "About", type: "anchor" },
      { id: "contact", href: "#contact", label: "Contact", type: "anchor" },
    ],
    []
  );

  const desktopItems = useMemo(() => {
    // Keep landing anchors for guests only; authenticated users should always see app routes.
    if (isLanding && !isAuthenticated) return [...routeItems, ...anchorItems];
    return routeItems;
  }, [isLanding, isAuthenticated, routeItems, anchorItems]);

  const containerRef = useRef(null);
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, height: 0, ready: false });

  const measure = useCallback(() => {
    const container = containerRef.current;
    const id = activeId;
    if (!container || !id) {
      setIndicator((s) => ({ ...s, width: 0, ready: false }));
      return;
    }
    const el = linkRefs.current[id];
    if (!el) {
      setIndicator((s) => ({ ...s, width: 0, ready: false }));
      return;
    }
    const cRect = container.getBoundingClientRect();
    const rRect = el.getBoundingClientRect();
    setIndicator({
      left: rRect.left - cRect.left + container.scrollLeft,
      width: rRect.width,
      height: rRect.height,
      ready: true,
    });
  }, [activeId]);

  useLayoutEffect(() => {
    measure();
  }, [measure, location.pathname, location.hash, mobileOpen, isLanding]);

  useLayoutEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    let ro;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [measure]);

  const setLinkRef = (id) => (el) => {
    if (el) linkRefs.current[id] = el;
    else delete linkRefs.current[id];
  };

  const headerClass = "sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md";

  const pillClass = "border border-slate-700/90 bg-slate-900/90 shadow-lg shadow-black/20";

  const linkIdle =
    "text-slate-300 hover:text-white hover:-translate-y-[1px]";

  const linkActive = "text-white animate-[navPop_220ms_ease-out]";

  const mobileBtnClass = "inline-flex rounded-full border border-slate-600 p-2 text-slate-200";

  const mobilePanelClass = "mt-3 flex flex-col gap-1 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-lg md:hidden";

  const isRouteActive = (item, isActive) => {
    if (item.type !== "route") return false;
    if (!isLanding) return isActive;
    const h = location.hash || "";
    if (item.id === "home") return isActive && !h;
    return isActive;
  };

  const isAnchorActive = (item) => {
    if (item.type !== "anchor") return false;
    return activeId === item.id;
  };

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    setProfileMenuOpen(false);
  };

  const handleRouteClick = (item, event, shouldCloseMobile = false) => {
    if (item?.id === "home" && isLanding) {
      event.preventDefault();
      if (location.hash) {
        window.history.replaceState(null, "", `${location.pathname}${location.search}`);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setProfileMenuOpen(false);
      if (shouldCloseMobile) setMobileOpen(false);
      return;
    }
    if (shouldCloseMobile) setMobileOpen(false);
  };

  useEffect(() => {
    if (!profileMenuOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [profileMenuOpen]);

  return (
    <header className={headerClass}>
      <style>{`
        @keyframes navPop {
          0% { transform: scale(0.96); }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="mx-auto flex max-w-6xl flex-col items-stretch px-4 py-4 sm:items-center">
        <nav
          className={`mx-auto flex w-full max-w-5xl items-center justify-end gap-2 rounded-full px-2 py-2 pl-3 md:justify-between md:pl-4 md:pr-2 ${pillClass}`}
          aria-label="Main navigation"
        >
          <div
            ref={containerRef}
            className="no-scrollbar relative hidden min-h-[2.25rem] min-w-0 flex-1 flex-wrap items-center gap-x-0 gap-y-2 md:flex"
          >
            {indicator.ready && indicator.width > 0 && (
              <span
                className="pointer-events-none absolute rounded-full bg-blue-600 transition-[left,width,height,opacity,transform] duration-300 ease-out"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  height: indicator.height,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 1,
                }}
                aria-hidden
              />
            )}

            {desktopItems.map((item) => {
              if (item.type === "route") {
                return (
                  <NavLink
                    key={item.id}
                    ref={setLinkRef(item.id)}
                    to={item.to}
                    end={item.end}
                    onClick={(e) => handleRouteClick(item, e)}
                    className={({ isActive }) =>
                      `relative z-10 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-95 md:px-3.5 ` +
                      (isRouteActive(item, isActive) ? linkActive : linkIdle)
                    }
                  >
                    {item.label}
                  </NavLink>
                );
              }
              return (
                <a
                  key={item.id}
                  ref={setLinkRef(item.id)}
                  href={item.href}
                  className={
                    `relative z-10 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-95 md:px-3.5 ` +
                    (isAnchorActive(item) ? linkActive : linkIdle)
                  }
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 md:flex-none md:justify-end">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardTo}
                  className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-500 active:scale-95 md:px-5"
                >
                  Dashboard
                </Link>
                <div ref={profileMenuRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={profileMenuOpen}
                    aria-label="Open user menu"
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-slate-200 transition-all duration-200 active:scale-95 ${
                      profileMenuOpen
                        ? "border-blue-400/70 bg-slate-700 text-white shadow-[0_0_0_3px_rgba(59,130,246,0.18)]"
                        : "border-slate-600 bg-slate-800 hover:-translate-y-[1px] hover:border-slate-500 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-48 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl shadow-black/50 ring-1 ring-slate-700/60 backdrop-blur animate-[navPop_180ms_ease-out]">
                      <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Account
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                      >
                        <LogOut className="h-4 w-4 text-rose-300" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                <NotificationBellSafe pollInterval={30000} />
              </>
            ) : (
              <Link
                to="/admin/login"
                className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-500 active:scale-95 md:px-5"
              >
                Login
              </Link>
            )}
            <button
              type="button"
              className={`${mobileBtnClass} md:hidden`}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className={mobilePanelClass}>
            {routeItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                onClick={(e) => handleRouteClick(item, e, true)}
                className={({ isActive }) =>
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                  (isRouteActive(item, isActive)
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-slate-800")
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isLanding &&
              anchorItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                    (isAnchorActive(item)
                      ? "bg-blue-600 text-white"
                      : "text-slate-200 hover:bg-slate-800")
                  }
                >
                  {item.label}
                </a>
              ))}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-left text-sm font-semibold text-rose-100 transition-colors hover:bg-rose-500/20"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
