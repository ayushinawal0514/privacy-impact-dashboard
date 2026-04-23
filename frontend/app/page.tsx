"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/25 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold text-white">
              HealthCompliance
            </Link>
            <p className="text-xs text-slate-300 mt-1">
              Secure Healthcare Privacy Monitoring
            </p>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
            {!session ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Secure Access to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Healthcare Privacy Compliance
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Automated privacy risk detection, compliance monitoring, and real-time
            alerting for HIPAA, DPDPA, and healthcare data protection standards.
          </p>

          <p className="text-sm text-cyan-300 mb-8">
            Protected by role-based authentication and secure session validation
          </p>


          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
                  Login to Dashboard
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

          {!session && (
            <div className="mb-14 text-sm text-slate-300 bg-white/5 border border-white/10 rounded-xl p-4 max-w-2xl mx-auto">
              <p className="font-semibold text-white mb-2">Demo Access</p>
              <p>Admin → admin@test.com</p>
              <p>Doctor → doctor@test.com</p>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 hover:bg-white/20 transition">
              <div className="text-3xl font-bold text-cyan-400 mb-2">HIPAA</div>
              <div className="text-white font-semibold">Compliance Monitoring</div>
              <p className="text-gray-300 text-sm mt-2">
                Continuous evaluation of healthcare privacy requirements
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 hover:bg-white/20 transition">
              <div className="text-3xl font-bold text-cyan-400 mb-2">Real-time</div>
              <div className="text-white font-semibold">Risk Detection</div>
              <p className="text-gray-300 text-sm mt-2">
                Rule-based identification of privacy and compliance threats
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 hover:bg-white/20 transition">
              <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-white font-semibold">Audit Monitoring</div>
              <p className="text-gray-300 text-sm mt-2">
                Continuous tracking of access events, alerts, and reports
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2026 Healthcare Privacy Compliance Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}