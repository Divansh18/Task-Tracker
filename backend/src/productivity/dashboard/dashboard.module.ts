import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { FocusModule } from '../../focus/focus.module';
import { ReflectionsModule } from '../../reflections/reflections.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), FocusModule, ReflectionsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}





