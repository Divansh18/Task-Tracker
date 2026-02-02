import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly productivityService: ProductivityService) {}

  @Get()
  getAnalytics(@CurrentUser() user: AuthUser) {
    return this.productivityService.getAnalytics(user);
  }
}


