"use client";

export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  animate = true,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  /** false while the initial value is still being hydrated, so the thumb
   *  doesn't visibly slide into place on page load. */
  animate?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full ${animate ? "transition-colors duration-200" : ""} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veg/50 focus-visible:ring-offset-2 disabled:opacity-40 ${
        checked ? "bg-veg" : "bg-neutral-300 dark:bg-neutral-600"
      }`}
    >
      <span
        // `left-0` matters: a <button>'s text-align: center would otherwise
        // park the thumb mid-track and the translate would measure from there.
        className={`absolute left-0 top-0.5 h-6 w-6 rounded-full bg-white shadow ${animate ? "transition-transform duration-200" : ""} ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
