import "./styles/globals.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import { useToastStore } from "./lib/useToast";
import { LoadingSpinner } from "./components/LoadingStates";
import { Sidebar } from "./components/Layout/Sidebar";
import { TopBar } from "./components/Layout/TopBar";

// Import pages
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { ProjectsPage } from "./pages/Projects/ProjectsPage";
import { ProjectList } from "./pages/ProjectList";
import { CreateProjectForm } from "./pages/CreateProjectForm";
import { ProjectEditor } from "./pages/ProjectEditor";
import { RunsListPage } from "./pages/Runs/RunsListPage";
import { RunDetailPage } from "./pages/Runs/RunDetailPage";
import { WorkflowsPage } from "./pages/Workflows/WorkflowsPage";
import { AgentStudioPage } from "./pages/AgentStudio/AgentStudioPage";
import { RepoPage } from "./pages/Repo/RepoPage";
import { DeploymentsPage } from "./pages/Deployments/DeploymentsPage";
import { KnowledgePage } from "./pages/Knowledge/KnowledgePage";
import { BillingPage } from "./pages/Billing/BillingPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, authLoading, checkAuth } = useStore();
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <LoadingSpinner size="lg" />
            <div className="absolute inset-0 blur-2xl bg-purple-500 opacity-50 -z-10"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading No-i-InTEAM...</p>
        </div>
      </div>
    );
  }

  // Show login/signup pages if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/signup" element={<SignupPage onLoginClick={() => {}} />} />
          <Route path="*" element={<LoginPage onSignupClick={() => {}} />} />
        </Routes>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "ml-[72px]" : "ml-[280px]"}`}>
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<CreateProjectForm onSuccess={() => {}} onCancel={() => {}} />} />
            <Route path="/projects/:id" element={<ProjectEditor projectId="" onBack={() => {}} />} />
            <Route path="/runs" element={<RunsListPage />} />
            <Route path="/runs/:runId" element={<RunDetailPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/agent-studio" element={<AgentStudioPage />} />
            <Route path="/repo" element={<RepoPage />} />
            <Route path="/deployments" element={<DeploymentsPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/legacy/list" element={<ProjectList onSelectProject={() => {}} />} />
          </Routes>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}