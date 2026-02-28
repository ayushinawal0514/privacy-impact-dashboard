"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function Home() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignup) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Signup failed");
          setIsLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="relative w-full max-w-4xl h-[550px] bg-white rounded-2xl shadow-xl overflow-hidden flex">

        <div className="relative w-1/2 h-full flex items-center justify-center p-10">
          <div
            className={`absolute w-full max-w-sm transition-all duration-500 ${
              isSignup
                ? "opacity-100 translate-x-0"
                : "opacity-0 pointer-events-none -translate-x-10"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Create Account
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              {error && <div className="text-sm text-red-500">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>

        <div className="relative w-1/2 h-full flex items-center justify-center p-10">
          <div
            className={`absolute w-full max-w-sm transition-all duration-500 ${
              isSignup
                ? "opacity-0 pointer-events-none translate-x-10"
                : "opacity-100 translate-x-0"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Sign In
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              {error && <div className="text-sm text-red-500">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center my-6 text-xs text-slate-400">
              <div className="flex-grow border-t" />
              <span className="mx-3">OR</span>
              <div className="flex-grow border-t" />
            </div>

            <button
              type="button"
              onClick={() =>
                signIn("google", { callbackUrl: "/dashboard" })
              }
              className="w-full flex items-center justify-center gap-3 border border-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.7 16.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.3 0 10.2-2 13.7-5.3l-6.3-5.2C29.5 35.1 26.9 36 24 36c-5.4 0-9.9-3.1-11.3-7.5l-6.6 5.1C9.6 39.7 16.3 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.2 5.5-6 7.2l6.3 5.2C39.8 36.6 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"
                />
              </svg>

              Continue with Google
            </button>
          </div>
        </div>

        <motion.div
          animate={{ x: isSignup ? "100%" : "0%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center p-10 z-20"
        >
          <h2 className="text-3xl font-bold mb-4 text-center">
            {isSignup ? "Welcome Back!" : "Hello, Friend!"}
          </h2>

          <p className="text-sm opacity-80 text-center mb-8 max-w-xs">
            {isSignup
              ? "To keep connected with us please login with your personal info"
              : "Enter your personal details and start your journey with us"}
          </p>

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="border border-white px-6 py-2 rounded-full text-sm hover:bg-white hover:text-indigo-600 transition"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}