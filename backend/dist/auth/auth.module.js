"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const users_module_1 = require("../users/users.module");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            users_module_1.UsersModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const rawExpiresIn = configService.get('jwt.accessTokenExpiresIn') ?? '3600s';
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
                        secret: configService.get('jwt.accessTokenSecret'),
                        signOptions: {
                            expiresIn,
                        },
                    };
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, jwt_auth_guard_1.JwtAuthGuard],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map