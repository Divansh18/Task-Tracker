import { AuthUser } from '../auth/types/auth-user.type';
import { FocusService } from './focus.service';
import { SetFocusTasksDto } from './dto/set-focus-tasks.dto';
import { FocusTask } from './entities/focus-task.entity';
export declare class FocusController {
    private readonly focusService;
    constructor(focusService: FocusService);
    getFocusTasks(user: AuthUser, date?: string): Promise<FocusTask[]>;
    setFocusTasks(user: AuthUser, payload: SetFocusTasksDto): Promise<FocusTask[]>;
}
