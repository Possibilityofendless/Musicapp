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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black bg-opacity-50 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎬</div>
              <h1 className="text-2xl font-bold text-white">MusicApp</h1>
              <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full text-white">
                AI Music Video
              </span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-4">
                <button
                  onClick={() => handleNavigation("list")}
                  className={`px-4 py-2 rounded font-medium transition ${
                    currentPage === "list"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Projects
                </button>
                {currentPage !== "create" && (
                  <button
                    onClick={() => handleNavigation("create")}
                    className="px-4 py-2 rounded font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition"
                  >
                    New Project
                  </button>
                )}
              </nav>
              {user && (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                  <div className="text-sm">
                    <p className="text-gray-300 font-medium">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-white transition rounded hover:bg-slate-700"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-100 px-6 py-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-200 hover:text-red-100"
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