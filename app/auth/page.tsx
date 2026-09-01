"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeTab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
        
        router.push("/admin");
      } else if (activeTab === "signup") {
        const { data: authData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        if (error) throw error;

        // Dispatch Custom Welcome & Account Confirmation Email via API
        fetch("/api/auth/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            name: fullName.trim(),
            userId: authData.user?.id,
          }),
        }).catch(e => console.warn("Confirmation email dispatch warning:", e));

        setSuccessMsg("Registration successful! A welcome & account confirmation email has been sent to your inbox.");
      } else {
        // Forgot Password Flow
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) throw error;

        setSuccessMsg("Password reset email sent! Check your inbox for the reset link.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to authenticate with ${provider}.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F6F0E7]/60 to-[#FBF8F3]">
      <div className="max-w-md w-full space-y-8 luxury-card p-8 bg-white border border-[#AD7D39]/20 shadow-xl relative overflow-hidden">
        
        {/* Decorative corner element */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#AD7D39]/5 rounded-full filter blur-xl" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#AD7D39] hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AD7D39] to-[#7D5121] flex items-center justify-center shadow-md">
              <span className="font-serif text-xl font-bold text-white">A</span>
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#191611]">
            {activeTab === "forgot" ? "Reset Password" : "Welcome to Afkar AlDar"}
          </h2>
          <p className="text-xs text-[#8A8378]">
            {activeTab === "forgot"
              ? "We'll send a password recovery email to your inbox."
              : "Access your order request history and tracking portal."}
          </p>
        </div>

        {/* Tab Toggle */}
        {activeTab !== "forgot" && (
          <div className="flex border-b border-[#3C2D1E]/10 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                activeTab === "login"
                  ? "border-[#AD7D39] text-[#AD7D39]"
                  : "border-transparent text-[#8A8378] hover:text-[#191611]"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                activeTab === "signup"
                  ? "border-[#AD7D39] text-[#AD7D39]"
                  : "border-transparent text-[#8A8378] hover:text-[#191611]"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 pt-2">
          {activeTab === "signup" && (
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Al Mansoori"
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A8378] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>
          </div>

          {activeTab !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("forgot");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[10px] font-bold text-[#AD7D39] hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A8378] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              {successMsg}
            </div>
          )}

          <TrackedButton
            type="submit"
            disabled={isLoading}
            button_location="navbar"
            variant="gold"
            size="md"
            className="w-full uppercase font-bold text-xs tracking-wider py-3 shadow-md"
          >
            <span>
              {isLoading
                ? "Please wait..."
                : activeTab === "login"
                ? "Sign In"
                : activeTab === "signup"
                ? "Register"
                : "Send Reset Link"}
            </span>
          </TrackedButton>

          {activeTab === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full text-center text-xs font-semibold text-[#8A8378] hover:text-[#191611] pt-2"
            >
              Back to Login
            </button>
          )}
        </form>

        {activeTab !== "forgot" && (
          <>
            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3C2D1E]/10" />
              </div>
              <span className="relative px-3 bg-white text-[10px] font-bold tracking-wider text-[#8A8378] uppercase">
                Or continue with
              </span>
            </div>

            {/* OAuth Social Buttons */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#3C2D1E]/15 hover:bg-[#F6F0E7] transition-all font-semibold text-[#191611]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6a5.64 5.64 0 0 1-2.44 3.7v3.08h3.94c2.31-2.13 3.64-5.26 3.64-8.61z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.94-3.08a7.17 7.17 0 0 1-10.42-3.77H1.47v3.2A11.98 11.98 0 0 0 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.24a7.18 7.18 0 0 1 0-4.48V6.56H1.47a11.98 11.98 0 0 0 0 10.88z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.93 11.93 0 0 0 12 0 11.98 11.98 0 0 0 1.47 6.56l4.13 3.2c.95-2.8 3.56-5.01 6.4-5.01z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("apple")}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#3C2D1E]/15 hover:bg-[#F6F0E7] transition-all font-semibold text-[#191611]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.548 0-1.711-.616-2.868-.598-1.52.022-2.923.885-3.702 2.24-1.573 2.733-.402 6.78 1.121 8.974.745 1.074 1.622 2.273 2.785 2.228 1.12-.045 1.543-.722 2.9-.722 1.346 0 1.727.722 2.9.7 1.182-.022 1.947-1.096 2.684-2.181.854-1.25 1.206-2.458 1.226-2.518-.041-.022-2.368-.908-2.392-3.593-.024-2.25 1.838-3.328 1.926-3.385-1.054-1.546-2.695-1.723-3.27-1.764-1.536-.123-2.993.939-3.51.939zm1.758-4.48c.683-.827 1.139-1.977.962-3.12-1 .04-2.213.666-2.931 1.503-.637.732-1.196 1.898-1.026 3.018 1.118.087 2.261-.538 2.995-1.401z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
