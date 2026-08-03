"use client";

import { useEffect, useMemo, useState } from "react";

interface User {
  _id: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersResponse {
  success: boolean;
  users?: User[];
  message?: string;
}

interface SaveResponse {
  success: boolean;
  user?: User;
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: UsersResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load users");
        }

        if (!cancelled) {
          setUsers(data.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Something went wrong";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const visibleUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) =>
      user.username.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const totalUsers = users.length;

  function openCreateForm() {
    setEditingUser(null);
    setForm({ username: "", password: "" });
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(user: User) {
    setEditingUser(user);
    setForm({ username: user.username, password: "" });
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (submitting) return;
    setIsFormOpen(false);
    setEditingUser(null);
    setForm({ username: "", password: "" });
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        username: form.username,
        ...(form.password ? { password: form.password } : {}),
        ...(editingUser ? { id: editingUser._id } : {}),
      };

      const response = await fetch("/api/user", {
        method: editingUser ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: SaveResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save user");
      }

      if (editingUser) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === editingUser._id
              ? {
                  ...user,
                  username: data.user?.username || user.username,
                }
              : user
          )
        );
        setNotice(`"${data.user?.username || form.username}" was updated.`);
      } else if (data.user) {
        setUsers((prev) => [data.user!, ...prev]);
        setNotice(`"${data.user.username}" was created.`);
      }

      closeForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function requestDelete(user: User) {
    setDeleteError(null);
    setDeleteTarget(user);
  }

  function cancelDelete() {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deleteTarget._id }),
      });

      const data: DeleteResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user._id !== deleteTarget._id));
      setNotice(`"${deleteTarget.username}" was deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f6f7f9]">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a07b42]">
                Content Management
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
                Users
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Manage dashboard users. All users are treated as admins in the background.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#a07b42] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#896735] hover:shadow-md"
            >
              + Add User
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {notice && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-700">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={totalUsers} />
          <StatCard label="Admins" value={totalUsers} />
          <StatCard label="Editors" value={0} />
          <StatCard label="Inactive" value={0} />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#111214] placeholder:text-gray-400 focus:border-[#a07b42] focus:outline-none focus:ring-2 focus:ring-[#a07b42]/20"
            />
          </div>

          <div className="text-sm text-gray-500">
            {visibleUsers.length} user{visibleUsers.length !== 1 ? "s" : ""} shown
          </div>
        </div>

        {error && !loading && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="grid gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm"
              >
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a07b42]/10 text-2xl">
              👤
            </div>
            <h2 className="text-lg font-semibold text-[#111214]">
              No users yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first dashboard user.
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex rounded-xl bg-[#a07b42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#896735]"
            >
              Create Your First User
            </button>
          </div>
        )}

        {!loading && !error && users.length > 0 && visibleUsers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
            <h2 className="text-base font-semibold text-[#111214]">
              No users match your search
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Try a different search term.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="mt-5 inline-flex rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#111214] transition hover:border-[#a07b42] hover:text-[#a07b42]"
            >
              Clear search
            </button>
          </div>
        )}

        {!loading && visibleUsers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/[0.06]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {visibleUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#111214]">{user.username}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-[#a07b42]/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#a07b42]">
                          Admin
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(user)}
                            className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-[#111214] transition hover:border-[#a07b42] hover:text-[#a07b42]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(user)}
                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isFormOpen && (
        <UserFormModal
          editing={!!editingUser}
          submitting={submitting}
          error={formError}
          value={form}
          onChange={setForm}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          deleting={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#111214]">
        {value}
      </p>
    </div>
  );
}

function UserFormModal({
  editing,
  submitting,
  error,
  value,
  onChange,
  onCancel,
  onSubmit,
}: {
  editing: boolean;
  submitting: boolean;
  error: string | null;
  value: { username: string; password: string };
  onChange: (value: { username: string; password: string }) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight text-[#111214]">
          {editing ? "Edit User" : "Add User"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {editing
            ? "Update the username or password."
            : "Create a new dashboard user."}
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111214]">
              Username
            </label>
            <input
              type="text"
              value={value.username}
              onChange={(e) =>
                onChange({ ...value, username: e.target.value })
              }
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm focus:border-[#a07b42] focus:outline-none focus:ring-2 focus:ring-[#a07b42]/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#111214]">
              Password {editing ? "(leave blank to keep current)" : ""}
            </label>
            <input
              type="password"
              value={value.password}
              onChange={(e) =>
                onChange({ ...value, password: e.target.value })
              }
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm focus:border-[#a07b42] focus:outline-none focus:ring-2 focus:ring-[#a07b42]/20"
              required={!editing}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#111214] transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#a07b42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#896735] disabled:opacity-60"
            >
              {submitting ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  user,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  user: User;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight text-[#111214]">
          Delete &quot;{user.username}&quot;?
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          This user will be permanently removed.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#111214] transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}