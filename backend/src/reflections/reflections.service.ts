import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyReflection } from './entities/daily-reflection.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { UpsertReflectionDto } from './dto/upsert-reflection.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReflectionsService {
  constructor(
    @InjectRepository(DailyReflection)
    private readonly reflectionRepository: Repository<DailyReflection>,
  ) {}

  private normalizeDate(date?: string): string {
    if (date) {
      return new Date(date).toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  }

  async getReflection(user: AuthUser, date?: string): Promise<DailyReflection | null> {
    const reflectDate = this.normalizeDate(date);
    return this.reflectionRepository.findOne({
      where: { user: { id: user.id }, reflectDate },
    });
  }

  async upsertReflection(user: AuthUser, dto: UpsertReflectionDto): Promise<DailyReflection> {
    const reflectDate = this.normalizeDate(dto.date);
    let reflection = await this.reflectionRepository.findOne({
      where: { user: { id: user.id }, reflectDate },
    });

    const payload = {
      wentWell: dto.wentWell?.trim() || null,
      blockers: dto.blockers?.trim() || null,
      winOfDay: dto.winOfDay?.trim() || null,
    };

    if (reflection) {
      Object.assign(reflection, payload);
    } else {
      reflection = this.reflectionRepository.create({
        user: { id: user.id } as User,
        reflectDate,
        ...payload,
      });
    }

    return this.reflectionRepository.save(reflection);
  }
}


