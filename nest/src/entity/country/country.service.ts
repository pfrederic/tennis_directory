import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Country } from './country.entity'

export class CountryService {
  constructor(
    @InjectRepository(Country) private countryRepository: Repository<Country>,
  ) {}

  findByCode(code: string): Promise<Country | null> {
    return this.countryRepository.findOneBy({ code })
  }
}
