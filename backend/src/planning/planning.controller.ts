import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { PlanningService } from './planning.service';
import { PlanningRequestDto } from './dto/planning-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Post('recommendations')
  getRecommendations(
    @CurrentUser() user: AuthUser,
    @Body() dto: PlanningRequestDto,
  ) {
    return this.planningService.getPlanningSuggestions(user, dto);
  }
}
