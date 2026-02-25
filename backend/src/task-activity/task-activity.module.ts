import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityController } from './task-activity.controller';
import { TaskActivityLog } from '../tasks/entities/task-activity.entity';
import { TasksModule } from '../tasks/tasks-module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskActivityLog]), forwardRef(() => TasksModule)],
  providers: [TaskActivityService],
  controllers: [TaskActivityController],
  exports: [TaskActivityService],
})
export class TaskActivityModule {}





