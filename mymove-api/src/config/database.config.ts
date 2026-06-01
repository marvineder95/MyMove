import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DB_LOGGING', false),
    ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: true } : false,
    timezone: 'Z',
    charset: 'utf8mb4',
  }),
  dataSourceFactory: async (options) => {
    const dataSource = await new DataSource(options!).initialize();
    return dataSource;
  },
};
