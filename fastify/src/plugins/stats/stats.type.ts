export type StatsBody = {
  avg_imc: number
  height_median: number
  country_with_best_ratio_win: {
    country_code: string
    win_ratio: number
  } | null
}
