export default function PlaceholderModulePage({ title }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          This is a placeholder page. Replace it with your real implementation.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        Add your UI/components for this module here.
      </div>
    </div>
  );
}
