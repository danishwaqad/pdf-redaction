export function PrivacyBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-900">
      <span aria-hidden>🔒</span>{" "}
      <strong>100% Private:</strong> Your PDF never leaves your browser. We cannot see your files.
    </div>
  );
}
