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
      const methods = this.metadataScanner.getAllMethodNames(
        controller?.metatype?.prototype,
      )
      methods.forEach(method => {
        const hasPaginationQueryDecorator = this.reflector.get<boolean>(
          PAGINATION_QUERY,
          controller?.metatype?.prototype[method],
        )

        const hasPaginatedDecorator = this.reflector.get<boolean>(
          PAGINATED_KEY,
          controller?.metatype?.prototype[method],
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
