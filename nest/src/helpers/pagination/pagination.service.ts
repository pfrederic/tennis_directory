import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'

import { PAGINATED_KEY } from './pagination.decorator'
import { PAGINATION_QUERY } from './pagination.query'

@Injectable()
export class PaginationService implements OnApplicationBootstrap {
  constructor(
    private discoveryService: DiscoveryService,
    private metadataScanner: MetadataScanner,
    private reflector: Reflector,
  ) {}
  onApplicationBootstrap() {
    const controllers = this.discoveryService.getControllers()
    controllers.forEach(controller => {
      const prototype = controller?.metatype?.prototype as
        Record<string, (...args: unknown[]) => unknown> | undefined
      if (!prototype) return

      const methods = this.metadataScanner.getAllMethodNames(prototype)
      methods.forEach(method => {
        // method comes straight from enumerating prototype's own methods, so it's always present.
        const target = prototype[method]!
        const hasPaginationQueryDecorator = this.reflector.get<boolean>(
          PAGINATION_QUERY,
          target,
        )

        const hasPaginatedDecorator = this.reflector.get<boolean>(
          PAGINATED_KEY,
          target,
        )
        if (hasPaginationQueryDecorator !== hasPaginatedDecorator) {
          throw new Error(
            `Missing ${!hasPaginationQueryDecorator ? 'paginationQuery decorator' : ''}${!hasPaginatedDecorator ? 'paginated decorator' : ''} in controller ${controller?.metatype?.name}, method ${method}`,
          )
        }
      })
    })
  }
}
