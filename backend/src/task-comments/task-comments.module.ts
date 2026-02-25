import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TaskComment } from '../tasks/entities/task-comment.entity';
import { TaskCommentsService } from './task-comments.service';
import { TaskCommentsController } from './task-comments.controller';
import { TaskActivityModule } from '../task-activity/task-activity.module';
import { TasksModule } from '../tasks/tasks-module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskComment]), TaskActivityModule, forwardRef(() => TasksModule)],
  providers: [TaskCommentsService],
  controllers: [TaskCommentsController],
  exports: [TaskCommentsService],
})
export class TaskCommentsModule {}





