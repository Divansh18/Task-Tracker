import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';

@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly productivityService: ProductivityService) {}

  @Get()
  getInsights(@CurrentUser() user: AuthUser) {
    return this.productivityService.getInsights(user);
  }
}


