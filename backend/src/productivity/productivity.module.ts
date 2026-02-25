import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InsightsModule } from './insights/insights.module';
import { PlanningModule } from './planning/planning.module';

@Module({
  imports: [AnalyticsModule, DashboardModule, InsightsModule, PlanningModule],
})
export class ProductivityModule {}


