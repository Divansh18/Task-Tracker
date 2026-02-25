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
exports.InsightsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../../tasks/entities/task.entity");
const task_status_enum_1 = require("../../tasks/enums/task-status.enum");
const task_energy_level_enum_1 = require("../../tasks/enums/task-energy-level.enum");
const focus_service_1 = require("../../focus/focus.service");
let InsightsService = class InsightsService {
    constructor(tasksRepository, focusService) {
        this.tasksRepository = tasksRepository;
        this.focusService = focusService;
    }
    startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    async getInsights(user) {
        const today = new Date();
        const startWindow = this.startOfDay(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000));
        const tasks = await this.tasksRepository.find({
            where: {
                user: { id: user.id },
                createdAt: (0, typeorm_2.MoreThanOrEqual)(startWindow),
            },
            order: { createdAt: 'DESC' },
        });
        const insights = [];
        const overdueRate = tasks.length > 0
            ? tasks.filter((task) => task.dueDate && task.status !== task_status_enum_1.TaskStatus.Done && task.dueDate < new Date()).length /
                tasks.length
            : 0;
        if (overdueRate > 0.3) {
            insights.push({
                id: 'overdue-trend',
                title: 'Tasks are frequently overdue',
                description: 'More than 30% of your tasks are slipping past their due dates. Consider scheduling smaller daily checkpoints or reducing your daily task load.',
                category: 'overdue',
            });
        }
        const focusAssignments = await this.focusService.getFocusTasks(user);
        const focusCompleted = focusAssignments.filter((focus) => focus.task.status === task_status_enum_1.TaskStatus.Done).length;
        if (focusAssignments.length >= 2 && focusCompleted / focusAssignments.length < 0.5) {
            insights.push({
                id: 'focus-follow-through',
                title: 'Focus tasks need attention',
                description: 'Less than half of your focus tasks are being completed. Try selecting fewer focus tasks or breaking them into smaller subtasks.',
                category: 'focus',
            });
        }
        const highEnergyTasks = tasks.filter((task) => task.energyLevel === task_energy_level_enum_1.TaskEnergyLevel.High);
        if (highEnergyTasks.length && highEnergyTasks.filter((task) => task.status !== task_status_enum_1.TaskStatus.Done).length > 0) {
            insights.push({
                id: 'energy-distribution',
                title: 'High-energy work piling up',
                description: 'You have pending high-energy tasks. Consider tackling one earlier in the day when energy is highest, or reassigning if possible.',
                category: 'energy',
            });
        }
        if (!insights.length) {
            insights.push({
                id: 'steady-progress',
                title: 'Progress on track',
                description: 'Your current workflow is balanced. Keep building on what is working well for you.',
                category: 'positive',
            });
        }
        return insights;
    }
};
exports.InsightsService = InsightsService;
exports.InsightsService = InsightsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        focus_service_1.FocusService])
], InsightsService);
//# sourceMappingURL=insights.service.js.map