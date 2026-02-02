import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FocusTask } from './entities/focus-task.entity';
import { FocusService } from './focus.service';
import { FocusController } from './focus.controller';
import { Task } from '../tasks/entities/task.entity';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TypeOrmModule.forFeature([FocusTask, Task]), forwardRef(() => TasksModule)],
  controllers: [FocusController],
  providers: [FocusService],
  exports: [FocusService],
})
export class FocusModule {}

