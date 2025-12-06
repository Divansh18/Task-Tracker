import { AuthUser } from '../auth/types/auth-user.type';
interface SafeUser {
    id: string;
    email: string;
    displayName?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UsersController {
    getProfile(user: AuthUser): SafeUser;
}
export {};
