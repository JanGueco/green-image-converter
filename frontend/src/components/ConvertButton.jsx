export default function ConvertButton({ disabled, loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full max-w-md mx-auto py-4 px-6 rounded-xl font-semibold uppercase tracking-wider text-white bg-[#2D6316] dark:bg-[#3A7D1E] hover:bg-[#245012] dark:hover:bg-[#2D6316] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2D6316] dark:disabled:hover:bg-[#3A7D1E] transition-colors flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Converting…
        </>
      ) : (
        'Convert All'
      )}
    </button>
  );
}
