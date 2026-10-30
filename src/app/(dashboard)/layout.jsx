import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import ProtectedRoute from "../../routes/ProtectedRoute.jsx";

// Every route in this group requires a server-confirmed session (see ProtectedRoute).
export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
