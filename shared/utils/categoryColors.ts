export const CATEGORY_COLORS = ['sage', 'terracotta', 'brown'] as const
export type CategoryColor = (typeof CATEGORY_COLORS)[number]

export function isCategoryColor(value: unknown): value is CategoryColor {
  return CATEGORY_COLORS.includes(value as CategoryColor)
}
