import { Inject, Injectable } from '@nestjs/common'
import { Player } from './player.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, ILike, Repository } from 'typeorm'
import { Sort } from '@/types/common'
import { AddPlayerDto } from './player.dto'
import { CountryService } from '@/entity/country/country.service'

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player) private playerRepository: Repository<Player>,
    @Inject(CountryService) private countryService: CountryService,
  ) {}

  findAll(
    limit: number,
    offset: number,
    search: string,
    sort: Sort,
  ): Promise<Player[]> {
    return this.playerRepository.find({
      take: limit,
      skip: offset,
      where: search
        ? [
            { firstname: ILike(`%${search}%`) },
            { lastname: ILike(`%${search}%`) },
          ]
        : undefined,
      order: {
        lastname: sort,
        firstname: sort,
      },
    })
  }

  findById(id: number): Promise<Player | null> {
    return this.playerRepository.findOneBy({ id })
  }

  async addPlayer(player: AddPlayerDto): Promise<Player> {
    const country = await this.countryService.findByCode(player.country)

    if (!country) {
      throw new Error(`Country with code ${player.country} not found`)
    }

    const newPlayer: DeepPartial<Player> = {
      firstname: player.firstname,
      lastname: player.lastname,
      shortname: player.shortname,
      sex: player.sex,
      picture: player.picture || null,
      birthday: player.birthday,
      weight: player.weight,
      height: player.height,
      country: country,
      points: player.points,
    }
    return this.playerRepository.save(newPlayer)
  }
}
