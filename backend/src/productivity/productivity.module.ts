import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { ProductivityService } from './productivity.service';
import { DashboardController } from './dashboard.controller';
import { InsightsController } from './insights.controller';
import { AnalyticsController } from './analytics.controller';
import { PlanningController } from './planning.controller';
import { FocusModule } from '../focus/focus.module';
import { ReflectionsModule } from '../reflections/reflections.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), FocusModule, ReflectionsModule],
  providers: [ProductivityService],
  controllers: [DashboardController, InsightsController, AnalyticsController, PlanningController],
})
export class ProductivityModule {}


