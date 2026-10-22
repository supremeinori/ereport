/**
 * Class tokens for the E-Report PBOBA interface.
 * Every token here maps to a decision written down in DESIGN.md.
 * Keep the visual language in one place instead of repeating it page by page.
 */

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Panel: flat surface, hairline border, single soft shadow. */
export const panel = "bg-surface border border-line rounded-lg shadow-panel";

/** Primary action. One accent, used only where the action is the point of the screen. */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-purple-700 text-white text-sm font-semibold transition-colors duration-150 hover:bg-purple-800 active:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed";

/** Secondary action, outlined. */
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-surface border border-line-strong text-ink text-sm font-semibold transition-colors duration-150 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed";

/** Quiet action, for in-page controls. */
export const btnQuiet =
  "inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-purple-50 hover:text-purple-900 disabled:opacity-50";

/** Destructive action, outlined so it never competes with the primary action. */
export const btnDanger =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-rose-300 bg-surface text-rose-700 text-sm font-semibold transition-colors duration-150 hover:bg-rose-50 hover:border-rose-400 disabled:opacity-50 disabled:cursor-not-allowed";

/** Small primary action, for actions inside table rows. */
export const btnSmall =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-purple-700 px-3 text-xs font-semibold text-white transition-colors duration-150 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed";

/** Small quiet action, for actions inside table rows. */
export const btnSmallQuiet =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:bg-purple-50 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed";

/** Form control. Labeled by a real <label>, never by placeholder alone. */
export const input =
  "w-full h-10 rounded-md border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors duration-150 focus:border-purple-600";

/** Textarea, same language as input but free height. */
export const textarea =
  "w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 transition-colors duration-150 focus:border-purple-600 resize-y";

export const label = "block text-sm font-medium text-ink mb-1.5";

/** Status badge. Square corners: this is data, not decoration. */
export const badge =
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap";

/** Table header cell. */
export const th = "px-4 py-3 text-left text-xs font-semibold text-ink-soft";

/** Table body cell. */
export const td = "px-4 py-3 text-sm text-ink align-middle";

/** Page heading block. */
export const pageTitle = "text-2xl font-bold tracking-tight text-ink";
export const pageSubtitle = "mt-1 text-sm text-ink-soft";

/** Hairline separator used between ledger rows. */
export const divider = "divide-y divide-line";
