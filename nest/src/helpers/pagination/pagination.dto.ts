import { Type } from 'class-transformer'
import { IsPositive, IsOptional, Max, IsInt } from 'class-validator'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  page: number = DEFAULT_PAGE

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Max(100)
  pageSize: number = DEFAULT_LIMIT

  get skip(): number {
    return (this.page - 1) * this.pageSize
  }

  get take(): number {
    return this.pageSize + 1
  }
}
