"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        setError("No response from authentication server.");
      } else if (result.error) {
        setError("Invalid email or password.");
      } else if (result.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-10">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-center text-sm mb-6">
            Enter your credentials to access your dashboard
          </p>
          <Link
            href="/register"
            className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-indigo-600 transition"
          >
            Create Account
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign In</h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link href="/register" className="text-indigo-600 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}