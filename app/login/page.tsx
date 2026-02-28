"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex-center bg-animated px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md glass-card"
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          Privacy Impact Assessment
        </h1>
        <p className="text-center text-white/60 mb-6">
          Secure Healthcare Cloud Compliance
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign In Securely"}
          </button>
        </form>

        <div className="my-6 text-center text-white/50 text-sm">OR</div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="btn-secondary w-full"
        >
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}