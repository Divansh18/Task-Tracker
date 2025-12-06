import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, AuthTokenPayload } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<AuthTokenPayload> {
    return this.authService.register(signUpDto);
  }

  @Post('login')
  login(@Body() signInDto: SignInDto): Promise<AuthTokenPayload> {
    return this.authService.login(signInDto);
  }
}
