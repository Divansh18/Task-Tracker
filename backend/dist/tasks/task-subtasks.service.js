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
exports.TaskSubtasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_subtask_entity_1 = require("./entities/task-subtask.entity");
const task_activity_service_1 = require("./task-activity.service");
const task_activity_type_enum_1 = require("./enums/task-activity-type.enum");
let TaskSubtasksService = class TaskSubtasksService {
    constructor(subtaskRepository, activityService) {
        this.subtaskRepository = subtaskRepository;
        this.activityService = activityService;
    }
    async list(task) {
        return this.subtaskRepository.find({
            where: { task: { id: task.id } },
            order: { position: 'ASC', createdAt: 'ASC' },
        });
    }
    async create(task, user, dto) {
        const highestPosition = await this.subtaskRepository
            .createQueryBuilder('subtask')
            .select('MAX(subtask.position)', 'max')
            .where('subtask.taskId = :taskId', { taskId: task.id })
            .getRawOne();
        const position = dto.position !== undefined ? dto.position : highestPosition?.max !== null ? highestPosition.max + 1 : 0;
        const subtask = this.subtaskRepository.create({
            title: dto.title,
            position,
            task: { id: task.id },
        });
        await this.subtaskRepository.save(subtask);
        await this.activityService.record(task, user, task_activity_type_enum_1.TaskActivityType.SubtaskAdded, {
            subtaskId: subtask.id,
            title: subtask.title,
        });
        return this.list(task);
    }
    async update(task, user, subtaskId, dto) {
        const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId }, relations: { task: true } });
        if (!subtask || subtask.task.id !== task.id) {
            throw new common_1.NotFoundException('Subtask not found');
        }
        const updates = {};
        if (dto.title !== undefined) {
            updates.title = dto.title;
        }
        if (dto.position !== undefined) {
            updates.position = dto.position;
        }
        let activityType = null;
        const metadata = { subtaskId: subtask.id };
        if (dto.isCompleted !== undefined) {
            updates.isCompleted = dto.isCompleted;
            updates.completedAt = dto.isCompleted ? new Date() : null;
            activityType = dto.isCompleted ? task_activity_type_enum_1.TaskActivityType.SubtaskCompleted : task_activity_type_enum_1.TaskActivityType.SubtaskReopened;
        }
        else {
            activityType = task_activity_type_enum_1.TaskActivityType.SubtaskUpdated;
        }
        Object.assign(subtask, updates);
        await this.subtaskRepository.save(subtask);
        await this.activityService.record(task, user, activityType, metadata);
        return this.list(task);
    }
    async remove(task, user, subtaskId) {
        const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId }, relations: { task: true } });
        if (!subtask || subtask.task.id !== task.id) {
            throw new common_1.NotFoundException('Subtask not found');
        }
        await this.subtaskRepository.remove(subtask);
        await this.activityService.record(task, user, task_activity_type_enum_1.TaskActivityType.SubtaskUpdated, {
            subtaskId,
            action: 'deleted',
        });
        return this.list(task);
    }
};
exports.TaskSubtasksService = TaskSubtasksService;
exports.TaskSubtasksService = TaskSubtasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_subtask_entity_1.TaskSubtask)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        task_activity_service_1.TaskActivityService])
], TaskSubtasksService);
//# sourceMappingURL=task-subtasks.service.js.map