import "./styles/globals.css";
import { useState, useEffect } from "react";
import { useStore } from "./store";
import { CreateProjectForm } from "./pages/CreateProjectForm";
import { ProjectEditor } from "./pages/ProjectEditor";
import { ProjectList } from "./pages/ProjectList";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AlertCircle, LogOut } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import { useToastStore } from "./lib/useToast";
import { LoadingSpinner } from "./components/LoadingStates";

function App() {
  const [currentPage, setCurrentPage] = useState<"list" | "editor" | "create" | "login" | "signup">(
    "login"
  );
  const { currentProjectId, error, clearError, isAuthenticated, authLoading, user, checkAuth, logout } = useStore();
  const { toasts, removeToast } = useToastStore();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setCurrentPage("login");
    } else if (!authLoading && isAuthenticated && currentPage === "login") {
      setCurrentPage("list");
    }
  }, [isAuthenticated, authLoading]);

  const handleNavigation = (page: "list" | "editor" | "create") => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage("login");
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <LoadingSpinner size="lg" />
            <div className="absolute inset-0 blur-2xl bg-purple-500 opacity-50 -z-10"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading imaginalllthat...</p>
        </div>
      </div>
    );
  }

  // Show login/signup pages if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {currentPage === "login" ? (
          <LoginPage onSignupClick={() => setCurrentPage("signup")} />
        ) : (
          <SignupPage onLoginClick={() => setCurrentPage("login")} />
        )}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-slate-600/30 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl drop-shadow-lg">🎬</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">imaginalllthat</h1>
              <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full text-white font-semibold shadow-lg">
                AI Music Video
              </span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-3">
                <button
                  onClick={() => handleNavigation("list")}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    currentPage === "list"
                      ? "btn-gradient text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  Projects
                </button>
                {currentPage !== "create" && (
                  <button
                    onClick={() => handleNavigation("create")}
                    className="px-5 py-2.5 rounded-xl font-semibold text-white btn-gradient hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    New Project
                  </button>
                )}
              </nav>
              {user && (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-600/50">
                  <div className="text-sm">
                    <p className="text-gray-200 font-semibold">{user.name}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-gray-400 hover:text-white transition-all rounded-lg hover:bg-slate-700/50 hover:scale-110"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="glass border-red-500/50 text-red-100 px-6 py-4 flex items-center gap-3 mx-6 mt-4 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-300 hover:text-red-100 transition hover:scale-110"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === "list" && (
          <ProjectList onSelectProject={(id) => {
            useStore.setState({ currentProjectId: id });
            handleNavigation("editor");
          }} />
        )}
        {currentPage === "create" && (
          <CreateProjectForm
            onSuccess={() => handleNavigation("list")}
            onCancel={() => handleNavigation("list")}
          />
        )}
        {currentPage === "editor" && currentProjectId && (
          <ProjectEditor
            projectId={currentProjectId}
            onBack={() => handleNavigation("list")}
          />
        )}
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}