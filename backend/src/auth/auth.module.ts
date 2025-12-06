import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rawExpiresIn =
          configService.get<string>('jwt.accessTokenExpiresIn') ?? '3600s';

        const expiresIn = (() => {
          if (/^\d+$/.test(rawExpiresIn)) {
            return Number(rawExpiresIn);
          }

          const matches = rawExpiresIn.match(/^(\d+)(ms|s|m|h|d)$/i);
          if (!matches) {
            return 3600;
          }

          const value = Number(matches[1]);
          const unit = matches[2].toLowerCase();

          switch (unit) {
            case 'ms':
              return Math.max(1, Math.round(value / 1000));
            case 's':
              return value;
            case 'm':
              return value * 60;
            case 'h':
              return value * 60 * 60;
            case 'd':
              return value * 60 * 60 * 24;
            default:
              return 3600;
          }
        })();

        return {
          secret: configService.get<string>('jwt.accessTokenSecret'),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
