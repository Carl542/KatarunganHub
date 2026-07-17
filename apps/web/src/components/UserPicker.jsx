"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function UserPicker({ value, onChange, roles, required, placeholder = "Select a person" }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/users/lookup")
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const options = roles ? users.filter((u) => roles.includes(u.role)) : users;

  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary disabled:opacity-60"
    >
      <option value="">{loading ? "Loading…" : placeholder}</option>
      {options.map((u) => (
        <option key={u.id} value={u.id}>
          {u.full_name} ({u.role})
        </option>
      ))}
    </select>
  );
}
