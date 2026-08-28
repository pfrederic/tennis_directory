import { TypeOrmModule } from '@nestjs/typeorm'
import PgConfig from './config/pg.config'

export default TypeOrmModule.forRootAsync({
  useFactory: () => ({
    ...PgConfig,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
  }),
})
