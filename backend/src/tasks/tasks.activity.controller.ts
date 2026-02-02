import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from './tasks.service';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityLog } from './entities/task-activity.entity';

@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/activity')
export class TaskActivityController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly activityService: TaskActivityService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
  ): Promise<TaskActivityLog[]> {
    const task = await this.tasksService.findOne(user, taskId);
    return this.activityService.listForTask(task);
  }
}


