import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export interface CreateUserInput {
    email: string;
    passwordHash: string;
    displayName?: string;
}
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    create(input: CreateUserInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
