import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { map } from 'rxjs/operators'
import { Reflector } from '@nestjs/core'
import { PAGINATED_KEY } from './pagination.decorator'

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const isPaginated = this.reflector.get<boolean>(
      PAGINATED_KEY,
      context.getHandler(),
    )
    if (!isPaginated) return next.handle()

    const request = context.switchToHttp().getRequest()

    return next.handle().pipe(
      map((items: unknown[]) => {
        const { page, pageSize } = request.pagination
        const hasNextPage = items.length > pageSize
        const data = hasNextPage ? items.slice(0, pageSize) : items
        return { data, page: page, pageSize: data.length, hasNextPage }
      }),
    )
  }
}
