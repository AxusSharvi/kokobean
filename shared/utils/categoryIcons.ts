export const CATEGORY_ICONS = ['checklist', 'home', 'heart', 'star', 'flag', 'bolt'] as const
export type CategoryIconName = (typeof CATEGORY_ICONS)[number]

export function isCategoryIcon(value: unknown): value is CategoryIconName {
  return CATEGORY_ICONS.includes(value as CategoryIconName)
}
