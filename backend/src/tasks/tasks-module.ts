import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Task } from './entities/task.entity';
import { TasksController } from './tasks-controller';
import { TasksService } from './tasks-service';
import { TaskSubtask } from './entities/task-subtask.entity';
import { TaskComment } from './entities/task-comment.entity';
import { TaskActivityLog } from './entities/task-activity.entity';
import { TaskSubtasksService } from './subtasks/task-subtasks.service';
import { TaskCommentsService } from './comments/task-comments.service';
import { TaskActivityService } from './activity/task-activity.service';
import { TaskSubtasksController } from './subtasks/task-subtasks.controller';
import { TaskCommentsController } from './comments/task-comments.controller';
import { TaskActivityController } from './activity/task-activity.controller';
import { FocusModule } from '../focus/focus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskSubtask, TaskComment, TaskActivityLog]),
    AuthModule,
    forwardRef(() => FocusModule),
  ],
  controllers: [TasksController, TaskSubtasksController, TaskCommentsController, TaskActivityController],
  providers: [TasksService, TaskSubtasksService, TaskCommentsService, TaskActivityService],
  exports: [TasksService, TaskActivityService],
})
export class TasksModule {}
