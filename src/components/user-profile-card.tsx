"use client";

import { useUser } from "@/hooks/useUser";

export default function UserProfileCard() {
  const { user, token, loading, error } = useUser();

  if (loading) {
    return <div className="p-4 border rounded shadow animate-pulse">Loading user data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
        Error loading user: {error.message}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 border rounded shadow">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="font-bold text-lg mb-2">User Profile</h2>
      <div className="space-y-1">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Last Sign In:</strong>{" "}
          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}
        </p>
        <p className="break-all">
          <strong>Token:</strong> {token}
        </p>
        <div className="bg-green-600" title={user.email ?? ""}>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
