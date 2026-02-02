import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyReflection } from './entities/daily-reflection.entity';
import { ReflectionsService } from './reflections.service';
import { ReflectionsController } from './reflections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailyReflection])],
  providers: [ReflectionsService],
  controllers: [ReflectionsController],
  exports: [ReflectionsService],
})
export class ReflectionsModule {}


