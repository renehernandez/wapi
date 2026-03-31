import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeviceApproval } from "~/components/DeviceApproval";
import {
  approveDeviceFn,
  denyDeviceFn,
  getDeviceCodeDetailsFn,
} from "~/server/functions/device-actions";

export const Route = createFileRoute("/auth/device")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: (search.code as string) || "",
  }),
  loaderDeps: ({ search }) => ({ code: search.code }),
  component: DeviceAuthPage,
  loader: async ({ deps }) => {
    if (!deps.code) return { found: false as const };

    const details = await getDeviceCodeDetailsFn({ data: deps.code });
    if (!details) return { found: false as const };

    return { found: true as const, details };
  },
});

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-sm w-full">
        {children}
      </div>
    </div>
  );
}

function DeviceAuthPage() {
  const data = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const search = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"approved" | "denied" | null>(null);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-gray-500 text-sm font-mono">
          &gt; Sign in via Cloudflare Access first.
        </p>
      </div>
    );
  }

  if (!data.found) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-gray-500 text-sm font-mono">
          &gt; Invalid or expired device code.
        </p>
      </div>
    );
  }

  if (result === "approved") {
    return (
      <CenteredCard>
        <div className="text-center">
          <p className="text-emerald-400 font-medium text-lg font-mono">
            Device approved!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You can close this window. The CLI will continue automatically.
          </p>
        </div>
      </CenteredCard>
    );
  }

  if (result === "denied") {
    return (
      <CenteredCard>
        <div className="text-center">
          <p className="text-gray-400 font-medium font-mono">Device denied.</p>
        </div>
      </CenteredCard>
    );
  }

  const { details } = data;
  const expired = details.expired || details.status !== "pending";

  async function handleApprove() {
    setLoading(true);
    try {
      await approveDeviceFn({ data: { code: search.code } });
      setResult("approved");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeny() {
    setLoading(true);
    try {
      await denyDeviceFn({ data: { code: search.code } });
      setResult("denied");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CenteredCard>
      <DeviceApproval
        code={search.code}
        machineName={details.machineName}
        expired={expired}
        onApprove={handleApprove}
        onDeny={handleDeny}
        loading={loading}
      />
    </CenteredCard>
  );
}
