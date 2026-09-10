import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator, HttpException, HttpStatus } from '@nestjs/common'
import type { ClassConstructor } from 'class-transformer'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

import type { PaginationDto } from './pagination.dto'
import type { RequestWithPagination } from './pagination.interface'

export const PAGINATION_QUERY = 'paginationQuery'

const paramDecorator = createParamDecorator(
  <T extends PaginationDto>(
    dtoClass: ClassConstructor<T>,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest<RequestWithPagination>()
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
): ParameterDecorator {
  const decorator = paramDecorator(dtoClass)

  return (target, propertyKey, parameterIndex) => {
    if (propertyKey !== undefined) {
      // propertyKey names the decorated method itself, so it's always present on target.
      Reflect.defineMetadata(
        PAGINATION_QUERY,
        true,
        (target as Record<string | symbol, object>)[propertyKey]!,
      )
    }
    decorator(target, propertyKey, parameterIndex)
  }
}
