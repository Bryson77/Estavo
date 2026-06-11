import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/Login";
import MfaVerifyPage from "@/pages/MfaVerify";
import DashboardPage from "@/pages/Dashboard";
import EstatesPage from "@/pages/Estates";
import ProvisionPage from "@/pages/Provision";
import BillingPage from "@/pages/Billing";
import SupportLogsPage from "@/pages/SupportLogs";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  const { authState } = useAuth();

  if (authState.status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (authState.status === "unauthenticated") {
    return <LoginPage />;
  }

  if (authState.status === "mfa_required") {
    return <MfaVerifyPage />;
  }

  if (authState.status === "unauthorized") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-900 mb-4">
            <svg
              className="w-7 h-7 text-red-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-6">
            Your account does not have platform admin access.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            Try a different account
          </button>
        </div>
      </div>
    );
  }

  // authState.status === "authenticated"
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/estates" component={EstatesPage} />
        <Route path="/provision" component={ProvisionPage} />
        <Route path="/billing" component={BillingPage} />
        <Route path="/support" component={SupportLogsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
