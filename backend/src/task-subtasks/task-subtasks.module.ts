import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TaskSubtask } from '../tasks/entities/task-subtask.entity';
import { TaskSubtasksService } from './task-subtasks.service';
import { TaskSubtasksController } from './task-subtasks.controller';
import { TaskActivityModule } from '../task-activity/task-activity.module';
import { TasksModule } from '../tasks/tasks-module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskSubtask]), TaskActivityModule, forwardRef(() => TasksModule)],
  providers: [TaskSubtasksService],
  controllers: [TaskSubtasksController],
  exports: [TaskSubtasksService],
})
export class TaskSubtasksModule {}





