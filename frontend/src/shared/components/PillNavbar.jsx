import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === "/";

  const dashboardTo = isAdmin ? "/admin/dashboard" : "/dashboard";

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
    () => [
      { id: "home", to: "/", label: "Home", end: true, type: "route" },
      { id: "resources", to: "/resources", label: "Resources", end: false, type: "route" },
      { id: "bookings", to: "/bookings", label: "Bookings", end: false, type: "route" },
      { id: "incidents", to: "/incidents", label: "Incidents", end: false, type: "route" },
    ],
    []
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
    if (isLanding) return [...routeItems, ...anchorItems];
    return routeItems;
  }, [isLanding, routeItems, anchorItems]);

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

  const linkIdle = "text-slate-300 hover:text-white";

  const linkActive = "text-white";

  const mobileBtnClass = "inline-flex rounded-full border border-slate-600 p-2 text-slate-200";

  const mobilePanelClass = "mt-3 flex flex-col gap-1 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-lg sm:hidden";

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

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-6xl flex-col items-stretch px-4 py-4 sm:items-center">
        <nav
          className={`mx-auto flex w-full max-w-5xl items-center justify-end gap-2 rounded-full px-2 py-2 pl-3 sm:justify-between sm:pl-4 sm:pr-2 ${pillClass}`}
          aria-label="Main navigation"
        >
          <div
            ref={containerRef}
            className="relative hidden min-h-[2.25rem] min-w-0 flex-1 flex-wrap items-center gap-x-0 gap-y-2 sm:flex"
          >
            {indicator.ready && indicator.width > 0 && (
              <span
                className="pointer-events-none absolute rounded-full bg-blue-600 transition-[left,width,height,opacity] duration-300 ease-out"
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
                    className={({ isActive }) =>
                      `relative z-10 rounded-full px-3 py-2 text-sm font-medium transition-colors md:px-3.5 ` +
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
                    `relative z-10 rounded-full px-3 py-2 text-sm font-medium transition-colors md:px-3.5 ` +
                    (isAnchorActive(item) ? linkActive : linkIdle)
                  }
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none sm:justify-end">
            {/* INSERT NOTIFICATION BELL*/}
            <NotificationBellSafe pollInterval={30000} />
            <Link
              to={dashboardTo}
              className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 sm:px-5"
            >
              Dashboard
            </Link>
            <button
              type="button"
              className={`${mobileBtnClass} sm:hidden`}
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
                onClick={() => setMobileOpen(false)}
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
          </div>
        )}
      </div>
    </header>
  );
}
