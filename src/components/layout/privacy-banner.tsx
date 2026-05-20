export function PrivacyBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center text-xs text-emerald-900 sm:px-4 sm:py-2 sm:text-sm">
      <span aria-hidden>🔒</span>{" "}
      <strong>100% Private:</strong> Your PDF never leaves your browser. We cannot see your files.
    </div>
  );
}
