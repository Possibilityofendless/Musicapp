import { useState } from "react";
import { Music, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useStore } from "../store";
import { useToast } from "../lib/useToast";
import { LoadingSpinner } from "../components/LoadingStates";

interface SignupPageProps {
  onLoginClick: () => void;
}

const perks = [
  "Unlimited storyboard scenes",
  "Realtime collaboration",
  "Priority rendering queue",
];

export function SignupPage({ onLoginClick }: SignupPageProps) {
  const { signup } = useStore();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!name.trim()) {
      setValidationError("Name is required");
      return;
    }
    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      setValidationError("Password is required");
      return;
    }
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Account created successfully! Welcome to imaginalllthat!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      setValidationError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="floating-orb bg-purple-600 top-0 left-0 animate-blob" />
      <div className="floating-orb bg-pink-500 top-16 right-0 animate-blob animation-delay-2000" />
      <div className="floating-orb bg-indigo-500 bottom-0 left-1/2 animate-blob animation-delay-4000" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Music className="w-10 h-10 text-purple-400 drop-shadow-lg" />
              <div className="absolute inset-0 blur-xl bg-purple-500 opacity-50 -z-10"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              imaginalllthat
            </h1>
          </div>
          <p className="text-gray-300 text-lg font-light">AI-Powered Music Video Generator</p>
        </div>

        {/* Signup Form */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl glow">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{validationError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                disabled={isLoading}
                className="input-base hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

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
                className="input-base hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="input-base hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-2">At least 8 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="input-base hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !name.trim() ||
                !email.trim() ||
                !password.trim() ||
                !confirmPassword.trim()
              }
              className="w-full mt-6 px-6 py-3 rounded-xl font-semibold text-white btn-gradient hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 glow flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={onLoginClick}
                disabled={isLoading}
                className="text-purple-400 hover:text-purple-300 hover:underline transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign in now
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="glass rounded-2xl p-4 border border-slate-600/40 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm font-semibold text-white">Team-ready security</p>
              <p className="text-xs text-gray-400">SSO, audit logs, and workspace invites in minutes.</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-slate-600/40">
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest text-purple-300">
              <Sparkles className="w-4 h-4" />
              Included benefits
            </div>
            <div className="grid gap-2">
              {perks.map((item) => (
                <div key={item} className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-purple-400/60 shadow" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
