import { Player } from './player.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlayerService } from './player.service'
import { PlayerController } from './player.controller'
import { CountryModule } from '../country/country.module'

@Module({
  imports: [TypeOrmModule.forFeature([Player]), CountryModule],
  providers: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}
