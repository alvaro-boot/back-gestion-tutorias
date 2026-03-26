import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const dbHost = this.configService.get<string>('DB_HOST', 'dpg-d6d4e65m5p6s73f5dm0g-a.oregon-postgres.render.com');
    
    // SSL para proveedores en la nube (Render, Railway, etc.)
    const ssl =
      dbHost.includes('render.com') ||
      dbHost.includes('rlwy.net') ||
      isProduction
        ? { rejectUnauthorized: false }
        : false;

    return {
      type: 'postgres',
      host: dbHost,
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME', 'gestion_tutorias'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: !isProduction,
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: ssl,
    };
  }
}
