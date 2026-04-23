"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRouterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const role = session?.user?.role;

    if (role === "admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/dashboard/user");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-300">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}