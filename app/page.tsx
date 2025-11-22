import Dashboard from "@/components/Dashboard";
import AuthGuard from "@/components/AuthGuard";

export default function Page() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
