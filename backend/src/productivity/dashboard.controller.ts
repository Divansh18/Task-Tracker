import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly productivityService: ProductivityService) {}

  @Get('today')
  getToday(@CurrentUser() user: AuthUser) {
    return this.productivityService.getTodayDashboard(user);
  }
}


