import { relativeTime } from "~/lib/relativeTime";

interface Device {
  id: string;
  name: string;
  lastSeenAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

interface DeviceListProps {
  devices: Device[];
  onRevoke: (machineId: string) => void;
  revoking?: string | null;
}

export function DeviceList({ devices, onRevoke, revoking }: DeviceListProps) {
  if (devices.length === 0) {
    return (
      <p className="font-mono text-gray-500 text-sm py-4">
        &gt; No devices registered. Use the CLI to connect a device.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {devices.map((device) => (
        <li
          key={device.id}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Status dot */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${device.revokedAt ? "bg-red-400" : "bg-emerald-500"}`}
            />
            <div className="min-w-0">
              <p className="font-mono text-sm font-medium text-gray-100 truncate">
                {device.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {device.revokedAt
                  ? `Revoked ${relativeTime(device.revokedAt)}`
                  : device.lastSeenAt
                    ? `Last seen ${relativeTime(device.lastSeenAt)}`
                    : "Never connected"}
              </p>
            </div>
          </div>

          {!device.revokedAt && (
            <button
              type="button"
              onClick={() => onRevoke(device.id)}
              disabled={revoking === device.id}
              className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-40 transition-colors shrink-0 px-2 py-1 rounded border border-transparent hover:border-red-400/30"
            >
              {revoking === device.id ? "Revoking..." : "Revoke"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
