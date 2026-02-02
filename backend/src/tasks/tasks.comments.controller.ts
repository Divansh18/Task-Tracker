import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from './tasks.service';
import { TaskCommentsService } from './task-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskComment } from './entities/task-comment.entity';

@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly commentsService: TaskCommentsService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
  ): Promise<TaskComment[]> {
    const task = await this.tasksService.findOne(user, taskId);
    return this.commentsService.list(task);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<TaskComment[]> {
    const task = await this.tasksService.findOne(user, taskId);
    return this.commentsService.create(task, user, dto);
  }
}


