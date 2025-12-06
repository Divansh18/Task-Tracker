import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { AuthUser } from './types/auth-user.type';

export interface AuthTokenPayload {
  accessToken: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(signUpDto: SignUpDto): Promise<AuthTokenPayload> {
    const existingUser = await this.usersService.findByEmail(signUpDto.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.hashPassword(signUpDto.password);
    const user = await this.usersService.create({
      email: signUpDto.email,
      passwordHash,
      displayName: signUpDto.displayName,
    });

    return this.buildAuthResponse(user);
  }

  async login(signInDto: SignInDto): Promise<AuthTokenPayload> {
    const user = await this.usersService.findByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private buildAuthResponse(
    user: AuthUser & { passwordHash?: string },
  ): AuthTokenPayload {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const safeUser = { ...user } as Partial<AuthUser> & {
      passwordHash?: string;
    };
    delete safeUser.passwordHash;
    return { accessToken, user: safeUser as AuthUser };
  }
}
