import { Repository } from 'typeorm';
import { DailyReflection } from './entities/daily-reflection.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { UpsertReflectionDto } from './dto/upsert-reflection.dto';
export declare class ReflectionsService {
    private readonly reflectionRepository;
    constructor(reflectionRepository: Repository<DailyReflection>);
    private normalizeDate;
    getReflection(user: AuthUser, date?: string): Promise<DailyReflection | null>;
    upsertReflection(user: AuthUser, dto: UpsertReflectionDto): Promise<DailyReflection>;
}
