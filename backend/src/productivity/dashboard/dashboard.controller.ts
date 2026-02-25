import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../auth/types/auth-user.type';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Keep route compatible with existing frontend client: /dashboard/today
  @Get('today')
  getTodayDashboard(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getTodayDashboard(user);
  }
}


