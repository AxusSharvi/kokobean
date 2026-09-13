export function usePointsBalance() {
  return useState<number>('points-balance', () => 0)
}
