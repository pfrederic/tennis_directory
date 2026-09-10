import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator'

import { PaginationDto } from '@/helpers/pagination/pagination.dto'
import { Sex, Sort } from '@/types/common'

export class GetPlayersDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search: string = ''

  @IsEnum(Sort)
  @IsOptional()
  rankSort: Sort = Sort.ASC
}

export class AddPlayerDto {
  @IsString()
  firstname: string

  @IsString()
  lastname: string

  @IsString()
  shortname: string

  @IsEnum(Sex)
  sex: Sex

  @IsUrl()
  @IsOptional()
  picture?: string

  @IsDateString()
  birthday: Date

  @IsInt()
  @Min(1)
  weight: number

  @IsInt()
  @Min(1)
  height: number

  @IsString()
  country: string

  @IsInt()
  @Min(1)
  points: number
}
