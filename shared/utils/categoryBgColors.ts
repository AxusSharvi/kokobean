export const CATEGORY_BG_COLORS = ['none', 'peach', 'sand', 'butter', 'sky'] as const
export type CategoryBgColor = (typeof CATEGORY_BG_COLORS)[number]

export const CATEGORY_BG_HEX: Record<CategoryBgColor, string> = {
  none: '#FFEED6',
  peach: '#FFD6BA',
  sand: '#FFE8CD',
  butter: '#DAD0C2',
  sky: '#CDBBA7'
}

// human-friendly names for accessibility labels -- kept separate from the
// enum keys above so the palette can be restyled without a DB migration
export const CATEGORY_BG_LABEL: Record<CategoryBgColor, string> = {
  none: 'default',
  peach: 'peach',
  sand: 'tan',
  butter: 'linen',
  sky: 'taupe'
}

export function isCategoryBgColor(value: unknown): value is CategoryBgColor {
  return CATEGORY_BG_COLORS.includes(value as CategoryBgColor)
}
