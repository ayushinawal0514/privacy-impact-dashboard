"use client";

import { signOut, useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-semibold">
            Dashboard
          </h1>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-white transition"
          >
            Sign Out
          </button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">
            Logged in as:
          </p>

          <p className="font-medium">
            {session?.user?.name}
          </p>

          <p className="text-sm text-slate-500">
            {session?.user?.email}
          </p>

          <p className="mt-4 text-sm">
            Role:{" "}
            <span className="font-medium">
              {session?.user?.role}
            </span>
          </p>
        </div>

      </div>
    </main>
  );
}