import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';
import { PlanningRequestDto } from './dto/planning-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('planning')
export class PlanningController {
  constructor(private readonly productivityService: ProductivityService) {}

  @Post('recommendations')
  getRecommendations(
    @CurrentUser() user: AuthUser,
    @Body() dto: PlanningRequestDto,
  ) {
    return this.productivityService.getPlanningSuggestions(user, dto);
  }
}


