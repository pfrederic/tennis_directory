import { Controller, Get, Inject } from '@nestjs/common'

import { StatsService } from './stats.service'
@Controller('stats')
export class StatsController {
  constructor(
    @Inject(StatsService) private readonly statsService: StatsService,
  ) {}

  @Get('')
  async getStats() {
    return {
      avg_imc: await this.statsService.getAVG_IMC(),
      height_median: await this.statsService.getHeightMedian(),
      country_with_best_ratio_win:
        await this.statsService.getCountryWithBestRatio(),
    }
  }
}
