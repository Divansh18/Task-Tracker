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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const task_priority_enum_1 = require("./enums/task-priority.enum");
const task_status_enum_1 = require("./enums/task-status.enum");
const task_energy_level_enum_1 = require("./enums/task-energy-level.enum");
const task_activity_service_1 = require("./task-activity.service");
const task_activity_type_enum_1 = require("./enums/task-activity-type.enum");
const task_subtasks_service_1 = require("./task-subtasks.service");
const task_comments_service_1 = require("./task-comments.service");
let TasksService = class TasksService {
    constructor(tasksRepository, activityService, subtasksService, commentsService) {
        this.tasksRepository = tasksRepository;
        this.activityService = activityService;
        this.subtasksService = subtasksService;
        this.commentsService = commentsService;
    }
    normalizeDate(date) {
        if (!date) {
            return null;
        }
        return new Date(date);
    }
    async create(user, dto) {
        const status = dto.status ?? task_status_enum_1.TaskStatus.Todo;
        const task = this.tasksRepository.create({
            title: dto.title,
            description: dto.description?.trim() || null,
            dueDate: this.normalizeDate(dto.dueDate),
            priority: dto.priority ?? task_priority_enum_1.TaskPriority.Medium,
            status,
            energyLevel: dto.energyLevel ?? task_energy_level_enum_1.TaskEnergyLevel.Medium,
            estimatedMinutes: dto.estimatedMinutes ?? null,
            completedAt: status === task_status_enum_1.TaskStatus.Done ? new Date() : null,
            user: { id: user.id },
        });
        const saved = await this.tasksRepository.save(task);
        await this.activityService.record(saved, user, task_activity_type_enum_1.TaskActivityType.TaskCreated, {
            status: saved.status,
            priority: saved.priority,
        });
        return this.findOne(user, saved.id);
    }
    async findAll(user, filters) {
        const qb = this.tasksRepository
            .createQueryBuilder('task')
            .where('task.userId = :userId', { userId: user.id })
            .orderBy('task.createdAt', 'DESC');
        if (filters.status) {
            qb.andWhere('task.status = :status', { status: filters.status });
        }
        if (filters.priority) {
            qb.andWhere('task.priority = :priority', { priority: filters.priority });
        }
        if (filters.energyLevel) {
            qb.andWhere('task.energyLevel = :energyLevel', { energyLevel: filters.energyLevel });
        }
        if (filters.dueBefore) {
            qb.andWhere('task.dueDate IS NOT NULL AND task.dueDate <= :dueBefore', {
                dueBefore: new Date(filters.dueBefore),
            });
        }
        if (filters.dueAfter) {
            qb.andWhere('task.dueDate IS NOT NULL AND task.dueDate >= :dueAfter', {
                dueAfter: new Date(filters.dueAfter),
            });
        }
        if (filters.search) {
            qb.andWhere(new typeorm_2.Brackets((where) => {
                where
                    .where('LOWER(task.title) LIKE :search', { search: `%${filters.search.toLowerCase()}%` })
                    .orWhere('LOWER(task.description) LIKE :search', { search: `%${filters.search.toLowerCase()}%` });
            }));
        }
        return qb.getMany();
    }
    async findOne(user, id) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: {
                user: true,
                focusAssignments: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.user.id !== user.id) {
            throw new common_1.ForbiddenException('You are not allowed to access this task');
        }
        const [subtasks, comments, activities] = await Promise.all([
            this.subtasksService.list(task),
            this.commentsService.list(task),
            this.activityService.listForTask(task),
        ]);
        task.subtasks = subtasks;
        task.comments = comments;
        task.activities = activities;
        return task;
    }
    async update(user, id, dto) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: { user: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.user.id !== user.id) {
            throw new common_1.ForbiddenException('You are not allowed to modify this task');
        }
        const changes = [];
        if (dto.title !== undefined && dto.title !== task.title) {
            changes.push({
                type: task_activity_type_enum_1.TaskActivityType.TaskUpdated,
                metadata: { field: 'title', previous: task.title, next: dto.title },
            });
            task.title = dto.title;
        }
        if (dto.description !== undefined && dto.description !== task.description) {
            changes.push({
                type: task_activity_type_enum_1.TaskActivityType.TaskUpdated,
                metadata: {
                    field: 'description',
                    previous: task.description,
                    hasNext: Boolean(dto.description),
                },
            });
            task.description = dto.description?.trim() || null;
        }
        if (dto.priority !== undefined && dto.priority !== task.priority) {
            changes.push({
                type: task_activity_type_enum_1.TaskActivityType.PriorityChanged,
                metadata: { previous: task.priority, next: dto.priority },
            });
            task.priority = dto.priority;
        }
        if (dto.energyLevel !== undefined && dto.energyLevel !== task.energyLevel) {
            changes.push({
                type: task_activity_type_enum_1.TaskActivityType.EnergyLevelUpdated,
                metadata: { previous: task.energyLevel, next: dto.energyLevel },
            });
            task.energyLevel = dto.energyLevel;
        }
        if (dto.estimatedMinutes !== undefined && dto.estimatedMinutes !== task.estimatedMinutes) {
            changes.push({
                type: task_activity_type_enum_1.TaskActivityType.EstimateUpdated,
                metadata: { previous: task.estimatedMinutes, next: dto.estimatedMinutes },
            });
            task.estimatedMinutes = dto.estimatedMinutes ?? null;
        }
        if (dto.dueDate !== undefined) {
            const nextDueDate = this.normalizeDate(dto.dueDate);
            const previous = task.dueDate ? task.dueDate.toISOString() : null;
            const next = nextDueDate ? nextDueDate.toISOString() : null;
            if (previous !== next) {
                changes.push({
                    type: task_activity_type_enum_1.TaskActivityType.DueDateChanged,
                    metadata: { previous: task.dueDate, next: nextDueDate },
                });
                task.dueDate = nextDueDate;
            }
        }
        if (dto.status !== undefined && dto.status !== task.status) {
            const previousStatus = task.status;
            task.status = dto.status;
            if (dto.status === task_status_enum_1.TaskStatus.Done) {
                task.completedAt = new Date();
            }
            else if (previousStatus === task_status_enum_1.TaskStatus.Done) {
                task.completedAt = null;
            }
            changes.push({
                type: task_activity_type_enum_1.TaskActivityType.StatusChanged,
                metadata: { previous: previousStatus, next: dto.status },
            });
        }
        await this.tasksRepository.save(task);
        for (const change of changes) {
            await this.activityService.record(task, user, change.type, change.metadata);
        }
        if (!changes.length) {
            await this.activityService.record(task, user, task_activity_type_enum_1.TaskActivityType.TaskUpdated);
        }
        return this.findOne(user, task.id);
    }
    async remove(user, id) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: { user: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.user.id !== user.id) {
            throw new common_1.ForbiddenException('You are not allowed to delete this task');
        }
        await this.activityService.record(task, user, task_activity_type_enum_1.TaskActivityType.TaskUpdated, {
            action: 'deleted',
        });
        await this.tasksRepository.remove(task);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        task_activity_service_1.TaskActivityService,
        task_subtasks_service_1.TaskSubtasksService,
        task_comments_service_1.TaskCommentsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map