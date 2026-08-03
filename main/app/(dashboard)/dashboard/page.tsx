"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  MessageSquare,
  Plus,
  Settings2,
  Users,
} from "lucide-react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ServiceRow = {
  _id: string;
  slug: string;
  title: string;
  categoryName: string;
  status: "draft" | "published";
};

type ProjectRow = {
  _id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
};

type BlogRow = {
  _id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
};

type BookingRow = {
  _id: string;
  name: string;
  service?: string;
  serviceType?: string;
  status: string;
  createdAt: string;
};

type UserRow = {
  _id: string;
  name?: string;
  email: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [servicesRes, projectsRes, blogsRes, bookingsRes, usersRes] =
          await Promise.all([
            fetch("/api/services", { cache: "no-store" }),
            fetch("/api/projects", { cache: "no-store" }),
            fetch("/api/blogs", { cache: "no-store" }),
            fetch("/api/bookings", { cache: "no-store" }),
            fetch("/api/user", { cache: "no-store" }),
          ]);

        const [servicesData, projectsData, blogsData, bookingsData, usersData] =
          await Promise.all([
            servicesRes.json(),
            projectsRes.json(),
            blogsRes.json(),
            bookingsRes.json(),
            usersRes.json(),
          ]);

        if (cancelled) return;

        setServices(
          Array.isArray(servicesData?.services) ? servicesData.services : []
        );
        setProjects(
          Array.isArray(projectsData?.projects) ? projectsData.projects : []
        );
        setBlogs(Array.isArray(blogsData?.blogs) ? blogsData.blogs : []);
        setBookings(
          Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : []
        );
        setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load dashboard data", err);
          setError("Failed to load dashboard data. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeProjectsCount = projects.filter(
    (p) => p.status === "published"
  ).length;

  const stats = [
    {
      title: "Total Services",
      value: String(services.length),
      description: "published & draft",
      icon: BriefcaseBusiness,
    },
    {
      title: "Active Projects",
      value: String(activeProjectsCount),
      description: "currently published",
      icon: FileText,
    },
    {
      title: "New Enquiries",
      value: String(bookings.length),
      description: "total bookings",
      icon: MessageSquare,
    },
    {
      title: "Team Members",
      value: String(users.length),
      description: "active users",
      icon: Users,
    },
  ];

  const recentServices = services.slice(0, 4);
  const recentEnquiries = bookings.slice(0, 4);

  return (
    <div className="min-h-full bg-[#f7f7f5] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-[#a17c42]">
              BSL Construction
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">
              Overview
            </h1>

            <p className="mt-2 text-sm text-[#737373] sm:text-base">
              Welcome back. Here&apos;s what&apos;s happening with your business.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#292929]"
            >
              <Plus size={17} />
              Add Service
            </Link>

            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#deded9] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#f2f2ef]"
            >
              <Plus size={17} />
              Add Project
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#e5e5e1] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5efe6] text-[#a17c42]">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-medium text-[#737373]">
                    {stat.title}
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <h2 className="text-3xl font-semibold tracking-tight text-[#171717]">
                      {loading ? "–" : stat.value}
                    </h2>

                    <span className="mb-1 text-xs text-[#8a8a8a]">
                      {stat.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Services */}
          <div className="rounded-2xl border border-[#e5e5e1] bg-white xl:col-span-2">
            <div className="flex items-center justify-between border-b border-[#eeeeeb] px-5 py-5">
              <div>
                <h2 className="font-semibold text-[#171717]">
                  Services
                </h2>

                <p className="mt-1 text-sm text-[#858585]">
                  Your latest services
                </p>
              </div>

              <Link
                href="/dashboard/services"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#a17c42] transition hover:text-[#80602f]"
              >
                View all
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="divide-y divide-[#eeeeeb]">
              {loading && (
                <div className="px-5 py-8 text-sm text-[#858585]">
                  Loading services…
                </div>
              )}

              {!loading && recentServices.length === 0 && (
                <div className="px-5 py-8 text-sm text-[#858585]">
                  No services yet.
                </div>
              )}

              {!loading &&
                recentServices.map((service) => (
                  <div
                    key={service._id}
                    className="flex flex-col gap-4 px-5 py-5 transition hover:bg-[#fafaf8] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5efe6]">
                        <BriefcaseBusiness
                          size={19}
                          className="text-[#a17c42]"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-[#171717]">
                          {service.title}
                        </h3>

                        <p className="mt-1 text-xs text-[#858585]">
                          {service.categoryName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          service.status === "published"
                            ? "bg-[#eef7ef] text-[#3d7a48]"
                            : "bg-[#f5efe6] text-[#9a7136]"
                        }`}
                      >
                        {service.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-[#e5e5e1] bg-white">
            <div className="border-b border-[#eeeeeb] px-5 py-5">
              <h2 className="font-semibold text-[#171717]">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-[#858585]">
                Manage your website
              </p>
            </div>

            <div className="space-y-3 p-5">
              <Link
                href="/dashboard/services/new"
                className="group flex items-center justify-between rounded-xl border border-[#eeeeeb] p-4 transition hover:border-[#d6c3a5] hover:bg-[#fcfaf7]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5efe6] text-[#a17c42]">
                    <Plus size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#171717]">
                      Create Service
                    </p>

                    <p className="mt-0.5 text-xs text-[#858585]">
                      Add a new service
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-[#999999] transition group-hover:text-[#a17c42]"
                />
              </Link>

              <Link
                href="/dashboard/projects/new"
                className="group flex items-center justify-between rounded-xl border border-[#eeeeeb] p-4 transition hover:border-[#d6c3a5] hover:bg-[#fcfaf7]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5efe6] text-[#a17c42]">
                    <BriefcaseBusiness size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#171717]">
                      Add Project
                    </p>

                    <p className="mt-0.5 text-xs text-[#858585]">
                      Showcase your work
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-[#999999] transition group-hover:text-[#a17c42]"
                />
              </Link>

              <Link
                href="/dashboard/blog/new"
                className="group flex items-center justify-between rounded-xl border border-[#eeeeeb] p-4 transition hover:border-[#d6c3a5] hover:bg-[#fcfaf7]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5efe6] text-[#a17c42]">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#171717]">
                      Write Blog Post
                    </p>

                    <p className="mt-0.5 text-xs text-[#858585]">
                      Publish new content
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-[#999999] transition group-hover:text-[#a17c42]"
                />
              </Link>

              <Link
                href="/dashboard/users"
                className="group flex items-center justify-between rounded-xl border border-[#eeeeeb] p-4 transition hover:border-[#d6c3a5] hover:bg-[#fcfaf7]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5efe6] text-[#a17c42]">
                    <Users size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#171717]">
                      Manage Users
                    </p>

                    <p className="mt-0.5 text-xs text-[#858585]">
                      Manage dashboard access
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-[#999999] transition group-hover:text-[#a17c42]"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Enquiries */}
        <div className="mt-6 rounded-2xl border border-[#e5e5e1] bg-white">
          <div className="flex items-center justify-between border-b border-[#eeeeeb] px-5 py-5">
            <div>
              <h2 className="font-semibold text-[#171717]">
                Recent Enquiries
              </h2>

              <p className="mt-1 text-sm text-[#858585]">
                Latest customer enquiries
              </p>
            </div>

            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#a17c42] transition hover:text-[#80602f]"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-[#eeeeeb] text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#999999]">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#999999]">
                    Service
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#999999]">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#999999]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eeeeeb]">
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-sm text-[#858585]">
                      Loading enquiries…
                    </td>
                  </tr>
                )}

                {!loading && recentEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-sm text-[#858585]">
                      No enquiries yet.
                    </td>
                  </tr>
                )}

                {!loading &&
                  recentEnquiries.map((enquiry) => (
                    <tr
                      key={enquiry._id}
                      className="transition hover:bg-[#fafaf8]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#171717]">
                          {enquiry.name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#737373]">
                        {enquiry.service ?? enquiry.serviceType ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#737373]">
                        {timeAgo(enquiry.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            enquiry.status === "new" || enquiry.status === "New"
                              ? "bg-[#f5efe6] text-[#9a7136]"
                              : enquiry.status === "contacted" ||
                                enquiry.status === "Contacted"
                              ? "bg-[#eef4fa] text-[#42698c]"
                              : "bg-[#eef7ef] text-[#3d7a48]"
                          }`}
                        >
                          {enquiry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}