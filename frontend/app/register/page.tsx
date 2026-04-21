"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData);
      router.push("/login");
    } catch {
      setError("Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 px-4">
      
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-10">
          <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
          <p className="text-center text-sm mb-6">
            Register to start analyzing privacy risks
          </p>
          <Link
            href="/login"
            className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-indigo-600 transition"
          >
            Sign In
          </Link>
        </div>

        {/* RIGHT */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Name"
              className="w-full border px-4 py-2 rounded-lg"
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              className="w-full border px-4 py-2 rounded-lg"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full border px-4 py-2 rounded-lg"
              onChange={handleChange}
            />

            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}