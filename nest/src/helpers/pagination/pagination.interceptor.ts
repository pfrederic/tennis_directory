import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { map } from 'rxjs/operators'

import { PAGINATED_KEY } from './pagination.decorator'
import type { RequestWithPagination } from './pagination.interface'

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const isPaginated = this.reflector.get<boolean>(
      PAGINATED_KEY,
      context.getHandler(),
    )
    if (!isPaginated) return next.handle()

    const request = context.switchToHttp().getRequest<RequestWithPagination>()

    return next.handle().pipe(
      map((items: unknown[]) => {
        // Set by the @PaginationQuery() param decorator, which always runs
        // before this pipe as part of the route handler's argument binding.
        const { page, pageSize } = request.pagination!
        const hasNextPage = items.length > pageSize
        const data = hasNextPage ? items.slice(0, pageSize) : items
        return { data, page: page, pageSize: data.length, hasNextPage }
      }),
    )
  }
}
