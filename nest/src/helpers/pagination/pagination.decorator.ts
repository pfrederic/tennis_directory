import { SetMetadata } from '@nestjs/common'

export const PAGINATED_KEY = 'paginated'
export const Paginated = () => SetMetadata(PAGINATED_KEY, true)
