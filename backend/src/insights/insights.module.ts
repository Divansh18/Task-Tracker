import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { FocusModule } from '../focus/focus.module';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), FocusModule],
  providers: [InsightsService],
  controllers: [InsightsController],
})
export class InsightsModule {}
