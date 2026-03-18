interface AuthDividerProps {
  label: string;
}

/** Horizontal divider with centered label text */
export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-border-primary" />
      <span className="text-[12px] font-medium uppercase tracking-wider text-fg-tertiary">
        {label}
      </span>
      <div className="h-px flex-1 bg-border-primary" />
    </div>
  );
}
