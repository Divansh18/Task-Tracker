import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { AppConfig } from './config/configuration';
import { validate } from './config/environment.validation';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { FocusModule } from './focus/focus.module';
import { ReflectionsModule } from './reflections/reflections.module';
import { ProductivityModule } from './productivity/productivity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get<AppConfig['database']>('database');
        if (!db) {
          throw new Error('Database configuration is missing');
        }
        return {
          type: 'mysql',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: true,
          migrations: ['dist/migrations/*.js'],
        };
      },
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    FocusModule,
    ReflectionsModule,
    ProductivityModule,
  ],
})
export class AppModule {}
