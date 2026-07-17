export const ROLES = {
  admin: "System Administrator",
  punong: "Punong Barangay",
  secretary: "Barangay/Lupon Secretary",
  lupon: "Lupon/Pangkat Member",
  complainant: "Complainant",
  respondent: "Respondent",
};

export const NAV_BY_ROLE = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: "grid" },
    { label: "User Accounts", path: "/dashboard/users", icon: "users" },
    { label: "Lupon Profiles", path: "/dashboard/lupon-members", icon: "users" },
    { label: "Audit Logs", path: "/dashboard/audit-logs", icon: "clipboard-list" },
    { label: "Reports", path: "/dashboard/reports", icon: "clipboard-list" },
    { label: "Notifications", path: "/dashboard/notifications", icon: "bell" },
    { label: "Settings", path: "/dashboard/settings", icon: "settings" },
  ],
  punong: [
    { label: "Dashboard", path: "/dashboard", icon: "grid" },
    { label: "Cases", path: "/dashboard/cases", icon: "clipboard-list" },
    { label: "Schedules", path: "/dashboard/schedules", icon: "calendar" },
    { label: "Lupon Profiles", path: "/dashboard/lupon-members", icon: "users" },
    { label: "Reports", path: "/dashboard/reports", icon: "clipboard-list" },
    { label: "Audit Logs", path: "/dashboard/audit-logs", icon: "clipboard-list" },
    { label: "Notifications", path: "/dashboard/notifications", icon: "bell" },
  ],
  secretary: [
    { label: "Dashboard", path: "/dashboard", icon: "grid" },
    { label: "Cases", path: "/dashboard/cases", icon: "clipboard-list" },
    { label: "Schedules", path: "/dashboard/schedules", icon: "calendar" },
    { label: "Register Case", path: "/dashboard/cases/register", icon: "file-text" },
    { label: "Reports", path: "/dashboard/reports", icon: "clipboard-list" },
    { label: "Audit Logs", path: "/dashboard/audit-logs", icon: "clipboard-list" },
    { label: "Notifications", path: "/dashboard/notifications", icon: "bell" },
  ],
  lupon: [
    { label: "Dashboard", path: "/dashboard", icon: "grid" },
    { label: "Cases", path: "/dashboard/cases", icon: "clipboard-list" },
    { label: "Schedules", path: "/dashboard/schedules", icon: "calendar" },
    { label: "Reports", path: "/dashboard/reports", icon: "clipboard-list" },
    { label: "Audit Logs", path: "/dashboard/audit-logs", icon: "clipboard-list" },
    { label: "Notifications", path: "/dashboard/notifications", icon: "bell" },
  ],
  complainant: [
    { label: "Dashboard", path: "/dashboard", icon: "grid" },
    { label: "My Cases", path: "/dashboard/my-cases", icon: "user-check" },
    { label: "Notifications", path: "/dashboard/notifications", icon: "bell" },
  ],
  respondent: [
    { label: "Dashboard", path: "/dashboard", icon: "grid" },
    { label: "My Cases", path: "/dashboard/my-cases", icon: "user-check" },
    { label: "Notifications", path: "/dashboard/notifications", icon: "bell" },
  ],
};
