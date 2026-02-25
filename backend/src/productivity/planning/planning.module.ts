import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [PlanningService],
  controllers: [PlanningController],
})
export class PlanningModule {}





