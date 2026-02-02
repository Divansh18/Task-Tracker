import { AuthUser } from '../auth/types/auth-user.type';
import { ReflectionsService } from './reflections.service';
import { UpsertReflectionDto } from './dto/upsert-reflection.dto';
import { DailyReflection } from './entities/daily-reflection.entity';
export declare class ReflectionsController {
    private readonly reflectionsService;
    constructor(reflectionsService: ReflectionsService);
    getReflection(user: AuthUser, date?: string): Promise<DailyReflection | null>;
    upsertReflection(user: AuthUser, dto: UpsertReflectionDto): Promise<DailyReflection>;
}
