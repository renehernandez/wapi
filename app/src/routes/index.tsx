import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { DeviceList } from "~/components/DeviceList";
import { SessionList } from "~/components/SessionList";
import {
  listDevicesFn,
  revokeDeviceFn,
} from "~/server/functions/device-actions";
import { listSessionsFn } from "~/server/functions/session-actions";

export const Route = createFileRoute("/")({
  component: Dashboard,
  loader: async () => {
    try {
      const [devices, sessions] = await Promise.all([
        listDevicesFn(),
        listSessionsFn({ data: { limit: 5 } }),
      ]);
      return { devices, sessions };
    } catch {
      return { devices: [], sessions: [] };
    }
  },
});

function Dashboard() {
  const { session } = Route.useRouteContext();
  const { devices, sessions } = Route.useLoaderData();
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-mono mb-2 text-gray-100">
            wappy<span className="animate-blink text-cyan-400 ml-0.5">_</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Sign in via Cloudflare Access to continue.
          </p>
        </div>
      </div>
    );
  }

  async function handleRevoke(machineId: string) {
    setRevoking(machineId);
    try {
      await revokeDeviceFn({ data: { machineId } });
      router.invalidate();
    } finally {
      setRevoking(null);
    }
  }

  const activeSessions = sessions.filter((s) => s.status === "active").length;
  const activeDevices = devices.filter((d) => !d.revokedAt).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-mono text-gray-100">
          wappy<span className="animate-blink text-cyan-400 ml-0.5">_</span>
        </h1>
        <p className="text-sm text-gray-500 font-mono mt-1">{session.email}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="font-mono text-2xl font-bold text-gray-100">
            {sessions.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">sessions</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="font-mono text-2xl font-bold text-emerald-400">
            {activeSessions}
          </p>
          <p className="text-xs text-gray-500 mt-1">active</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="font-mono text-2xl font-bold text-cyan-400">
            {activeDevices}
          </p>
          <p className="text-xs text-gray-500 mt-1">devices</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold font-mono text-gray-200">
            Recent Sessions
          </h2>
          <Link
            to="/sessions"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <SessionList sessions={sessions} />
      </div>

      {/* Devices */}
      <div>
        <h2 className="text-base font-semibold font-mono text-gray-200 mb-3">
          Registered Devices
        </h2>
        <DeviceList
          devices={devices}
          onRevoke={handleRevoke}
          revoking={revoking}
        />
      </div>
    </div>
  );
}
