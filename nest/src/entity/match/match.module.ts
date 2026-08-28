import { TypeOrmModule } from '@nestjs/typeorm'
import { Match } from './match.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  providers: [],
})
export class MatchModule {}
