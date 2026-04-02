export default function PlaceholderModulePage({ title }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          This is a placeholder page. Replace it with your real implementation.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 text-sm text-slate-300">
        Add your UI/components for this module here.
      </div>
    </div>
  );
}
