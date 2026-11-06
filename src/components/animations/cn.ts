/** Class names, the ones that apply. */
export const cn = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
