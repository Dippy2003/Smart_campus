import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllResources } from "../../features/member1-resources/services/resourceApi";
import { useAuth } from "../../features/member4-auth/Contexts/AuthContext";
import {
  Building2,
  CalendarClock,
  AlertTriangle,
  Bell,
  LogIn,
  User,
  ShieldCheck,
  Wrench,
  MapPin,
  Monitor,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Users,
  Lock,
  ClipboardList,
  Mail,
  Phone,
  Globe,
  GraduationCap,
} from "lucide-react";

function SmartCampusLandingPage() {
  const { isAuthenticated } = useAuth();
  const features = [
    {
      icon: Building2,
      title: "Facilities & Assets Catalogue",
      description:
        "Centralized directory of lecture halls, labs, equipment, and shared spaces with real-time availability.",
      to: "/resources",
    },
    {
      icon: CalendarClock,
      title: "Booking Management",
      description:
        "Request and manage bookings for rooms and assets with approval workflows and conflict prevention.",
      to: "/bookings",
    },
    {
      icon: AlertTriangle,
      title: "Incident Ticketing",
      description:
        "Report issues instantly, attach details, and track maintenance tickets from creation to resolution.",
      to: "/incidents/create",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Stay informed with status updates, booking reminders, and maintenance alerts across the campus.",
      to: "/incidents/my",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Login",
      description:
        "Authenticate securely using your university credentials and access role-based dashboards.",
    },
    {
      step: "02",
      title: "Select Resource",
      description:
        "Search and filter facilities, labs, and equipment by type, capacity, and location.",
    },
    {
      step: "03",
      title: "Request / Report",
      description:
        "Submit booking requests or incident reports with clear details, schedules, and priorities.",
    },
    {
      step: "04",
      title: "Track & Get Updates",
      description:
        "Monitor approvals, ticket progress, and receive notifications until completion.",
    },
  ];

  const roles = [
    {
      icon: User,
      title: "User",
      description:
        "Students and staff can discover resources, request bookings, report incidents, and view real-time statuses.",
    },
    {
      icon: ShieldCheck,
      title: "Admin",
      description:
        "Administrative staff configure resources, approve requests, manage permissions, and analyze campus utilization.",
    },
    {
      icon: Wrench,
      title: "Technician",
      description:
        "Maintenance teams receive incident tickets, update progress, log work done, and close tasks efficiently.",
    },
  ];

  // This section is now populated from the backend resources API
  // to keep the landing page in sync with the live catalog.
  const [previewResources, setPreviewResources] = useState([]);
  const [previewError, setPreviewError] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    async function loadPreview() {
      try {
        const res = await getAllResources();
        const data = res?.data ?? [];
        setPreviewResources(Array.isArray(data) ? data.slice(0, 4) : []);
        setPreviewError("");
      } catch (e) {
        setPreviewError(
          "Unable to load live resources. Showing sample data instead."
        );
      }
    }

    loadPreview();
  }, []);

  const fallbackResources = [
    {
      id: 1,
      name: "Lecture Hall A",
      type: "LECTURE_HALL",
      location: "Block C, Level 2",
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "Computer Lab 1",
      type: "LAB",
      location: "ICT Building, Level 3",
      status: "ACTIVE",
    },
    {
      id: 3,
      name: "Projector X200",
      type: "EQUIPMENT",
      location: "Equipment Store, Ground Floor",
      status: "OUT_OF_SERVICE",
    },
    {
      id: 4,
      name: "Meeting Room B",
      type: "MEETING_ROOM",
      location: "Administration Block, Level 1",
      status: "ACTIVE",
    },
  ];

  const resourcesToShow =
    previewResources && previewResources.length > 0
      ? previewResources
      : fallbackResources;

  const quickLinks = [
    { label: "User Guide", href: "#resources" },
    { label: "Feature Overview", href: "#features" },
    { label: "Q & A", href: "#faq" },
    { label: "Project Documentation", href: "#about" },
  ];

  const aboutHighlights = [
    {
      icon: Sparkles,
      title: "Usability First",
      description:
        "Clear interfaces, guided workflows, and role-aware actions help users complete tasks quickly with minimal training.",
    },
    {
      icon: Lock,
      title: "Secure by Design",
      description:
        "Role-based access control and auditable activity patterns ensure responsible handling of operational data.",
    },
    {
      icon: ClipboardList,
      title: "Traceable Operations",
      description:
        "Every booking and incident can be tracked across its full lifecycle, improving accountability and service quality.",
    },
  ];

  const faqItems = [
    {
      question: "What is the Smart Campus Operations Hub?",
      answer:
        "It is a single place to browse campus facilities and equipment, request bookings, and report maintenance issues—with clear status tracking for everyone involved.",
    },
    {
      question: "How do I book a room or piece of equipment?",
      answer:
        "Use Bookings from the navigation bar. Choose a resource, pick a time that fits the rules shown, and submit your request. You can follow approval or scheduling updates from your bookings view.",
    },
    {
      question: "How do I report an incident or maintenance problem?",
      answer:
        "Open Incidents → Create Ticket, describe the issue, set priority and category, and add photos if helpful. You will receive updates on the ticket as staff or technicians progress the work.",
    },
    {
      question: "Who can see my tickets and bookings?",
      answer:
        "You always see your own requests. Administrators and assigned technicians see only what they need to operate the system—such as approving bookings or handling assigned tickets.",
    },
    {
      question: "How does the admin dashboard differ from the user view?",
      answer:
        "Admins manage resources, review bookings, assign work, and monitor campus-wide activity. Everyday users focus on discovering resources, submitting requests, and tracking their own items.",
    },
    {
      question: "Is this a production university system?",
      answer:
        "This project is built for academic demonstration. It shows realistic workflows and data patterns that could be extended into a full production deployment with institutional authentication and policies.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50" id="home">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6 lg:px-8 lg:pt-12">
        <section className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
               Smart Campus Operations Hub
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Manage Campus Resources{" "}
              <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
                Smarter
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Smart Campus Operations Hub centralizes facility bookings, asset
              allocation, and incident reporting into one intuitive platform. Book
              lecture halls, labs, meeting rooms, and equipment, while tracking
              maintenance tickets and campus issues in real time.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/resources"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 transition hover:bg-blue-400"
              >
                Get Started
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/admin/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-blue-500/70 hover:bg-slate-900"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 sm:text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span>Improved utilization of campus spaces</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span>Faster resolution of maintenance issues</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 bg-gradient-to-br from-blue-500/10 via-sky-400/05 to-blue-900/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-2xl shadow-blue-900/40 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        Live Bookings
                      </span>
                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-300">
                        Campus
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-semibold leading-none text-blue-300">
                      32
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      Active reservations across halls and labs
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-500/25 bg-slate-950/75 p-5 shadow-lg shadow-blue-900/40">
                    <p className="text-xs font-semibold text-slate-200">
                      Maintenance Queue
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-3xl font-semibold leading-none text-blue-300">
                        12
                      </span>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">
                        8 In Progress
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      Technicians are resolving reported incidents.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/80">
                    <p className="text-xs font-semibold text-slate-200">
                      Today&apos;s Schedule
                    </p>
                    <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-center justify-between gap-4 rounded-lg border border-slate-800/60 bg-slate-950/30 px-2.5 py-1.5">
                        <span>Lecture Hall A</span>
                        <span className="text-slate-400">08:00–10:00</span>
                      </li>
                      <li className="flex items-center justify-between gap-4 rounded-lg border border-slate-800/60 bg-slate-950/30 px-2.5 py-1.5">
                        <span>Computer Lab 1</span>
                        <span className="text-slate-400">11:00–13:00</span>
                      </li>
                      <li className="flex items-center justify-between gap-4 rounded-lg border border-slate-800/60 bg-slate-950/30 px-2.5 py-1.5">
                        <span>Meeting Room B</span>
                        <span className="text-slate-400">15:00–16:30</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-800/90 bg-slate-950/85 p-4 text-xs text-slate-300">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                      <AlertTriangle className="h-4 w-4 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">
                        Priority Incident
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                        Projector X200 reported as faulty in Lecture Hall B. Ticket
                        assigned to AV technician.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center text-[11px] text-slate-500">
                Dashboard-style illustration showcasing bookings, incidents, and
                resource utilization for the Smart Campus Operations Hub.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-28 mt-16 space-y-8 md:mt-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">
                Core Features for Campus Operations
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Designed to support academic institutions in managing complex
                physical resources with clarity, accountability, and data-driven
                decisions.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.to}
                className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg shadow-slate-950/60 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-900/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 shadow-inner shadow-blue-900/40">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {feature.description}
                </p>
                <div className="mt-4 h-0.5 w-10 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">
                How the Hub Works
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                A straightforward workflow that encourages adoption from students,
                lecturers, administrators, and maintenance teams.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-4">
            {steps.map((stepItem) => (
              <div
                key={stepItem.step}
                className="relative flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-md shadow-slate-950/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Step {stepItem.step}
                  </span>
                  <span className="h-6 w-6 rounded-full border border-blue-500/50 bg-blue-500/10 text-center text-xs font-semibold text-blue-300">
                    {stepItem.step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-50">
                  {stepItem.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  {stepItem.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">
                Role-Based Experience
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Each stakeholder interacts with the system through a tailored
                workflow, ensuring clarity of responsibilities and secure access.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-md shadow-slate-950/60 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                    <role.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    {role.title}
                  </h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="resources" className="mt-16 md:mt-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">
                Sample Campus Resources
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                A preview of how facilities and assets are represented inside the
                Smart Campus Operations Hub.
              </p>
            </div>
          </div>

          {previewError && (
            <p className="mt-3 text-xs text-amber-300">{previewError}</p>
          )}

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {resourcesToShow.map((resource) => (
              <div
                key={resource.id ?? resource.name}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-md shadow-slate-950/60 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-900/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-50">
                      {resource.name}
                    </h3>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {resource.type}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                      resource.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/10 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {resource.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-blue-300" />
                  <span>{resource.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-7 shadow-2xl shadow-blue-900/40 md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="relative grid gap-6 md:grid-cols-[2fr,1fr] md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">
                  Ready to simplify campus operations?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-slate-200">
                  Deploy the Smart Campus Operations Hub in your university to
                  standardize bookings, reduce conflicts, and ensure that
                  maintenance activities are transparent and accountable.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {!isAuthenticated && (
                    <Link
                      to="/admin/login"
                      className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 transition hover:bg-blue-400"
                    >
                      Login Now
                    </Link>
                  )}
                  <Link
                    to="/resources"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200/70 bg-slate-950/40 px-5 py-2.5 text-sm font-semibold text-slate-50 transition hover:border-blue-200 hover:bg-slate-900/70"
                  >
                    Explore Resources
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 rounded-2xl bg-slate-950/60 p-4 text-xs text-slate-300">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Why institutions adopt this hub
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>Clear visibility of room and equipment utilization.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>Structured process for incident reporting and follow-up.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>Data to support infrastructure planning and budgeting.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-28 mt-10 md:mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-7 shadow-xl shadow-slate-950/50 md:p-10">
            <div className="absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300/90">
                Q &amp; A
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-50 sm:text-2xl">
                Common questions
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Quick answers about bookings, incidents, and how different roles
                use the hub.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {faqItems.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={item.question}
                      className="rounded-xl border border-slate-800/90 bg-slate-950/70 transition hover:border-slate-700"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqIndex(isOpen ? null : index)
                        }
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-medium text-slate-100">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-blue-300 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-800/80 px-4 pb-3 pt-0">
                          <p className="pt-3 text-xs leading-relaxed text-slate-300">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-28 mt-16 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-xl shadow-slate-950/60 md:mt-20 md:p-9"
        >
          <div className="grid gap-8 lg:grid-cols-[1.3fr,1fr] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300">
                About the Project
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-50 sm:text-2xl">
                Built to modernize campus operations
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Smart Campus Operations Hub is a university final-year project
                designed to bring booking, asset visibility, and incident handling
                into one connected system. Instead of scattered spreadsheets and
                disconnected communication, teams use a shared workflow with clear
                statuses, ownership, and timelines.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                The platform demonstrates how institutions can reduce scheduling
                conflicts, improve maintenance turnaround, and make better
                infrastructure decisions using operational data. It is built as an
                academic prototype with production-minded structure and scalability.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Core Roles
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-blue-300">3</p>
                  <p className="text-xs text-slate-400">Users, Admins, Technicians</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Key Modules
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-blue-300">4</p>
                  <p className="text-xs text-slate-400">Resources, Bookings, Incidents, Alerts</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Target
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-blue-300">1</p>
                  <p className="text-xs text-slate-400">Unified campus operations hub</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {aboutHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-md shadow-slate-950/70"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="scroll-mt-28 border-t border-slate-800 bg-slate-950/95">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-lg shadow-blue-500/40">
                  <Monitor className="h-4 w-4 text-slate-950" />
                </div>
                <span className="text-sm font-semibold text-slate-100">
                  Smart Campus Operations Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A modern web-based platform for managing university facilities,
                assets, and maintenance workflows, designed as a comprehensive
                final-year project for real-world campus operations.
              </p>
              <div className="grid gap-2 pt-1 text-xs text-slate-300 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-300" />
                  <span>Academic demonstration project</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-blue-300" />
                  <span>Designed for multi-role collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-blue-300" />
                  <span>Role-aware secure workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-300" />
                  <span>Scalable for institutional growth</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Quick Links
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-blue-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Contact
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-blue-300" />
                  <a
                    href="mailto:smartcampus@university.edu"
                    className="transition-colors hover:text-blue-400"
                  >
                    smartcampus@university.edu
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-blue-300" />
                  <span>+94 11 234 5678</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-300" />
                  <span>Campus ICT Innovation Lab</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} Smart Campus Operations Hub. For academic
            demonstration and evaluation purposes.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SmartCampusLandingPage;
