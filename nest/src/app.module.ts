import { Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import databaseModule from './database.module'
import { PlayerModule } from './entity/player/player.module'
import { StatsModule } from './entity/stats/stats.module'
import { PaginationInterceptor } from './helpers/pagination/pagination.interceptor'
import { PaginationService } from './helpers/pagination/pagination.service'

@Module({
  imports: [databaseModule, PlayerModule, StatsModule, DiscoveryModule],
  providers: [
    { provide: 'APP_INTERCEPTOR', useClass: PaginationInterceptor },
    PaginationService,
  ],
})
export class AppModule {}
