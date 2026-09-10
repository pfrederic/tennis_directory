import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Body,
} from '@nestjs/common'

import { AddPlayerDto, GetPlayersDto } from './player.dto'
import { PlayerService } from './player.service'

import { Paginated } from '@/helpers/pagination/pagination.decorator'
import { PaginationQuery } from '@/helpers/pagination/pagination.query'

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}
  @Get('')
  @Paginated()
  getPlayers(
    @PaginationQuery(GetPlayersDto)
    query: GetPlayersDto,
  ) {
    const { skip, take, search, rankSort } = query
    return this.playerService.findAll(take, skip, search, rankSort)
  }

  @Get(':id')
  async getPlayerById(@Param() { id }: { id: number }) {
    const player = await this.playerService.findById(id)
    if (!player) throw new NotFoundException(null, 'No player found')
    return player
  }

  @Post('')
  async createPlayer(@Body() createPlayerDto: AddPlayerDto) {
    return this.playerService.addPlayer(createPlayerDto)
  }
}
