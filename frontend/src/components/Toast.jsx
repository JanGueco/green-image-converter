export default function Toast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#e8e8e6] dark:bg-[#1C1C1C] border border-red-400 dark:border-red-500/50 text-red-800 dark:text-red-200 shadow-lg max-w-[90vw]"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-inherit"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
