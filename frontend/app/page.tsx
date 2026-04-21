"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-white">
              Healthcare Privacy Platform
            </div>
            <div className="flex gap-4">
              {!session ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-white hover:bg-white/10 rounded transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Healthcare Data Privacy
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Compliance Platform
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Automated privacy risk detection, compliance monitoring, and ML-powered anomaly detection
            for HIPAA, DPDPA, and healthcare data protection standards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {session ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
              >
                Access Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 rounded-lg font-bold hover:bg-cyan-400/20 transition shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-1 inline-block hover:border-cyan-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 hover:bg-white/20 transition">
              <div className="text-3xl font-bold text-cyan-400 mb-2">100%</div>
              <div className="text-white font-semibold">HIPAA Compliant</div>
              <p className="text-gray-300 text-sm mt-2">
                Full compliance with healthcare privacy standards
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 hover:bg-white/20 transition">
              <div className="text-3xl font-bold text-cyan-400 mb-2">Real-time</div>
              <div className="text-white font-semibold">Risk Detection</div>
              <p className="text-gray-300 text-sm mt-2">
                Instant identification of privacy threats
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 hover:bg-white/20 transition">
              <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-white font-semibold">Monitoring</div>
              <p className="text-gray-300 text-sm mt-2">
                Continuous compliance and anomaly detection
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                "ML-powered anomaly detection",
                "Comprehensive risk assessment",
                "Automated compliance scoring",
                "Real-time alert system",
                "Access log analysis",
                "DPDPA compliance tracking",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2026 Healthcare Privacy Compliance Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
