export default function MetricsBar({ fileCount, status }) {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-center py-3 px-4 bg-[#eee] dark:bg-[#1C1C1C]/80 rounded-xl border border-[#ddd] dark:border-[#333]">
      <span className="px-3 py-1.5 rounded-lg bg-[#e0e0e0] dark:bg-[#252525] text-sm text-[#555] dark:text-[#aaa]">
        Files queued: <strong className="text-[#1C1C1C] dark:text-white">{fileCount}</strong>
      </span>
      <span className="px-3 py-1.5 rounded-lg bg-[#e0e0e0] dark:bg-[#252525] text-sm text-[#555] dark:text-[#aaa]">
        Status: <strong className="text-[#1C1C1C] dark:text-white capitalize">{status}</strong>
      </span>
    </div>
  );
}
