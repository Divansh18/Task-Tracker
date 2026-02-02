import { User } from '../../users/entities/user.entity';
export declare class DailyReflection {
    id: string;
    user: User;
    reflectDate: string;
    wentWell?: string | null;
    blockers?: string | null;
    winOfDay?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
