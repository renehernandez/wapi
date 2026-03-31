interface DeviceApprovalProps {
  code: string;
  machineName: string;
  expired: boolean;
  onApprove: () => void;
  onDeny: () => void;
  loading?: boolean;
}

export function DeviceApproval({
  code,
  machineName,
  expired,
  onApprove,
  onDeny,
  loading,
}: DeviceApprovalProps) {
  if (expired) {
    return (
      <div className="text-center">
        <p className="text-red-400 font-medium">
          This device code has expired.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please generate a new code from the CLI.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-5">
      <div>
        <h2 className="text-lg font-bold font-mono text-gray-100">
          Authorize Device
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Confirm this code matches your terminal
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 inline-block mx-auto">
        <p className="text-3xl font-mono font-bold tracking-[0.3em] text-cyan-400">
          {code}
        </p>
      </div>

      <p className="text-sm text-gray-400">
        Device:{" "}
        <span className="font-mono font-medium text-gray-200">
          {machineName}
        </span>
      </p>

      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={onApprove}
          disabled={loading}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? "Approving..." : "Approve"}
        </button>
        <button
          type="button"
          onClick={onDeny}
          disabled={loading}
          className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors border border-slate-600"
        >
          Deny
        </button>
      </div>
    </div>
  );
}
