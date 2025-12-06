import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthUser } from './types/auth-user.type';
export interface AuthTokenPayload {
    accessToken: string;
    user: AuthUser;
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(signUpDto: SignUpDto): Promise<AuthTokenPayload>;
    login(signInDto: SignInDto): Promise<AuthTokenPayload>;
    private hashPassword;
    private buildAuthResponse;
}
