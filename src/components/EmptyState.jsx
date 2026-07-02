export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-tile border-2 border-dashed border-ink/15 bg-white/50 px-6 py-14 text-center">
      {Icon && (
        <div className="grid h-14 w-14 place-items-center rounded-full bg-sand text-ink/60">
          <Icon size={26} />
        </div>
      )}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="max-w-xs text-sm text-ink/60">{description}</p>}
      {action}
    </div>
  );
}
