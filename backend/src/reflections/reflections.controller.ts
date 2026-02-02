import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { ReflectionsService } from './reflections.service';
import { UpsertReflectionDto } from './dto/upsert-reflection.dto';
import { DailyReflection } from './entities/daily-reflection.entity';

@UseGuards(JwtAuthGuard)
@Controller('reflections')
export class ReflectionsController {
  constructor(private readonly reflectionsService: ReflectionsService) {}

  @Get()
  getReflection(
    @CurrentUser() user: AuthUser,
    @Query('date') date?: string,
  ): Promise<DailyReflection | null> {
    return this.reflectionsService.getReflection(user, date);
  }

  @Post()
  upsertReflection(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertReflectionDto,
  ): Promise<DailyReflection> {
    return this.reflectionsService.upsertReflection(user, dto);
  }
}


