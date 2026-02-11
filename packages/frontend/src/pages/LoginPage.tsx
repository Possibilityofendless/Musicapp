import { useState } from "react";
import { Music, AlertCircle } from "lucide-react";
import { useStore } from "../store";
import { useToast } from "../lib/useToast";
import { LoadingSpinner } from "../components/LoadingStates";

interface LoginPageProps {
  onSignupClick: () => void;
}

export function LoginPage({ onSignupClick }: LoginPageProps) {
  const { login } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }
    if (!password.trim()) {
      setValidationError("Password is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setValidationError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">imaginalllthat</h1>
          </div>
          <p className="text-gray-400">AI-Powered Music Video Generator</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{validationError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full mt-6 px-6 py-3 rounded font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={onSignupClick}
                disabled={isLoading}
                className="text-purple-400 hover:text-purple-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2 font-medium">Demo Credentials:</p>
          <p className="text-xs text-gray-500">Email: demo@example.com</p>
          <p className="text-xs text-gray-500">Password: password123</p>
        </div>
      </div>
    </div>
  );
}
