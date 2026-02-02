"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const focus_task_entity_1 = require("./entities/focus-task.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const task_activity_service_1 = require("../tasks/task-activity.service");
const task_activity_type_enum_1 = require("../tasks/enums/task-activity-type.enum");
const task_status_enum_1 = require("../tasks/enums/task-status.enum");
let FocusService = class FocusService {
    constructor(focusRepository, taskRepository, activityService) {
        this.focusRepository = focusRepository;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
    }
    normalizeDate(date) {
        if (date) {
            return new Date(date).toISOString().slice(0, 10);
        }
        return new Date().toISOString().slice(0, 10);
    }
    async getFocusTasks(user, date) {
        const focusDate = this.normalizeDate(date);
        return this.focusRepository.find({
            where: {
                user: { id: user.id },
                focusDate,
            },
            relations: { task: true },
            order: { position: 'ASC', createdAt: 'ASC' },
        });
    }
    async updateFocusTasks(user, payload) {
        const focusDate = this.normalizeDate(payload.date);
        const previous = await this.focusRepository.find({
            where: { user: { id: user.id }, focusDate },
            relations: { task: true },
        });
        if (payload.taskIds.length > 3) {
            throw new common_1.BadRequestException('You can only select up to 3 focus tasks per day.');
        }
        if (!payload.taskIds.length) {
            for (const focus of previous) {
                await this.activityService.record(focus.task, user, task_activity_type_enum_1.TaskActivityType.FocusCleared, {
                    focusDate,
                });
            }
            await this.focusRepository
                .createQueryBuilder()
                .delete()
                .where('userId = :userId AND focusDate = :focusDate', { userId: user.id, focusDate })
                .execute();
            return [];
        }
        const tasks = await this.taskRepository.find({
            where: {
                id: (0, typeorm_2.In)(payload.taskIds),
                user: { id: user.id },
            },
        });
        if (tasks.length !== payload.taskIds.length) {
            throw new common_1.BadRequestException('One or more tasks are invalid.');
        }
        const eligibleTasks = tasks.filter((task) => task.status !== task_status_enum_1.TaskStatus.Done);
        if (eligibleTasks.length !== tasks.length) {
            throw new common_1.BadRequestException('Completed tasks cannot be selected as focus tasks.');
        }
        const previousIds = new Set(previous.map((item) => item.task.id));
        const nextIds = new Set(payload.taskIds);
        const toRemove = previous.filter((focus) => !nextIds.has(focus.task.id));
        const toAdd = payload.taskIds.filter((taskId) => !previousIds.has(taskId));
        await this.focusRepository
            .createQueryBuilder()
            .delete()
            .where('userId = :userId AND focusDate = :focusDate', { userId: user.id, focusDate })
            .execute();
        const focusTasks = payload.taskIds.map((taskId, index) => this.focusRepository.create({
            user: { id: user.id },
            task: { id: taskId },
            focusDate,
            position: index,
        }));
        await this.focusRepository.save(focusTasks);
        for (const focus of toRemove) {
            await this.activityService.record(focus.task, user, task_activity_type_enum_1.TaskActivityType.FocusCleared, {
                focusDate,
            });
        }
        for (const taskId of toAdd) {
            const task = tasks.find((item) => item.id === taskId);
            await this.activityService.record(task, user, task_activity_type_enum_1.TaskActivityType.FocusAssigned, {
                focusDate,
            });
        }
        return this.getFocusTasks(user, focusDate);
    }
};
exports.FocusService = FocusService;
exports.FocusService = FocusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(focus_task_entity_1.FocusTask)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        task_activity_service_1.TaskActivityService])
], FocusService);
//# sourceMappingURL=focus.service.js.map