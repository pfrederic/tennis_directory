import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { PaginationDto } from './pagination.dto'

export const PAGINATION_QUERY = 'paginationQuery'

const paramDecorator = createParamDecorator(
  <T extends PaginationDto>(
    dtoClass: ClassConstructor<T>,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest()
    const instance = plainToInstance(dtoClass, request.query)
    const errors = validateSync(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    })
    if (errors.length > 0) {
      throw new HttpException(
        `Validation failed: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`,
        HttpStatus.BAD_REQUEST,
      )
    }
    const page = instance.page
    const pageSize = instance.pageSize
    request.pagination = { page, pageSize }

    return instance
  },
)

export function PaginationQuery<T extends PaginationDto>(
  dtoClass: ClassConstructor<T>,
) {
  const decorator = paramDecorator(dtoClass)

  return (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    Reflect.defineMetadata(PAGINATION_QUERY, true, target[propertyKey])
    decorator(target, propertyKey, parameterIndex)
  }
}
