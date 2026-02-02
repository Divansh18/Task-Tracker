import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from './tasks.service';
import { TaskSubtasksService } from './task-subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { TaskSubtask } from './entities/task-subtask.entity';

@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/subtasks')
export class TaskSubtasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly subtasksService: TaskSubtasksService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
  ): Promise<TaskSubtask[]> {
    const task = await this.tasksService.findOne(user, taskId);
    return this.subtasksService.list(task);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
  ): Promise<TaskSubtask[]> {
    const task = await this.tasksService.findOne(user, taskId);
    return this.subtasksService.create(task, user, dto);
  }

  @Patch(':subtaskId')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
  ): Promise<TaskSubtask[]> {
    const task = await this.tasksService.findOne(user, taskId);
    return this.subtasksService.update(task, user, subtaskId, dto);
  }

  @Delete(':subtaskId')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
  ): Promise<TaskSubtask[]> {
    const task = await this.tasksService.findOne(user, taskId);
    return this.subtasksService.remove(task, user, subtaskId);
  }
}


