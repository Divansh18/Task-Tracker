import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { FocusService } from './focus.service';
import { SetFocusTasksDto } from './dto/set-focus-tasks.dto';
import { FocusTask } from './entities/focus-task.entity';

@UseGuards(JwtAuthGuard)
@Controller('focus')
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Get()
  getFocusTasks(
    @CurrentUser() user: AuthUser,
    @Query('date') date?: string,
  ): Promise<FocusTask[]> {
    return this.focusService.getFocusTasks(user, date);
  }

  @Post()
  setFocusTasks(
    @CurrentUser() user: AuthUser,
    @Body() payload: SetFocusTasksDto,
  ): Promise<FocusTask[]> {
    return this.focusService.updateFocusTasks(user, payload);
  }
}


