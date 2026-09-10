import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CountryModule } from '../country/country.module'

import { PlayerController } from './player.controller'
import { Player } from './player.entity'
import { PlayerService } from './player.service'

@Module({
  imports: [TypeOrmModule.forFeature([Player]), CountryModule],
  providers: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}
