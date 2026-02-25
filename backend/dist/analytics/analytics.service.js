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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../tasks/entities/task.entity");
const task_status_enum_1 = require("../tasks/enums/task-status.enum");
let AnalyticsService = class AnalyticsService {
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }
    startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    endOfDay(date) {
        const start = this.startOfDay(date);
        return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
    }
    formatDate(date) {
        return date.toISOString().slice(0, 10);
    }
    async getAnalytics(user) {
        const today = new Date();
        const start = this.startOfDay(new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000));
        const completionTrendRaw = await this.tasksRepository
            .createQueryBuilder('task')
            .select('DATE(task.completedAt)', 'date')
            .addSelect('COUNT(task.id)', 'count')
            .where('task.userId = :userId', { userId: user.id })
            .andWhere('task.completedAt BETWEEN :start AND :end', {
            start,
            end: this.endOfDay(today),
        })
            .groupBy('DATE(task.completedAt)')
            .orderBy('DATE(task.completedAt)', 'ASC')
            .getRawMany();
        const overdueTrendRaw = await this.tasksRepository
            .createQueryBuilder('task')
            .select('DATE(task.dueDate)', 'date')
            .addSelect('COUNT(task.id)', 'count')
            .where('task.userId = :userId', { userId: user.id })
            .andWhere('task.status != :done', { done: task_status_enum_1.TaskStatus.Done })
            .andWhere('task.dueDate BETWEEN :start AND :end', {
            start,
            end: this.endOfDay(today),
        })
            .groupBy('DATE(task.dueDate)')
            .orderBy('DATE(task.dueDate)', 'ASC')
            .getRawMany();
        const priorityBreakdown = await this.tasksRepository
            .createQueryBuilder('task')
            .select('task.priority', 'priority')
            .addSelect('SUM(CASE WHEN task.status = :done THEN 1 ELSE 0 END)', 'completed')
            .addSelect('SUM(CASE WHEN task.status != :done THEN 1 ELSE 0 END)', 'open')
            .where('task.userId = :userId', { userId: user.id })
            .groupBy('task.priority')
            .setParameters({ done: task_status_enum_1.TaskStatus.Done })
            .getRawMany();
        const energyLevelBreakdown = await this.tasksRepository
            .createQueryBuilder('task')
            .select('task.energyLevel', 'energyLevel')
            .addSelect('COUNT(task.id)', 'count')
            .where('task.userId = :userId', { userId: user.id })
            .groupBy('task.energyLevel')
            .getRawMany();
        const completionTrend = [];
        for (let offset = 0; offset < 14; offset += 1) {
            const date = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
            const dateKey = this.formatDate(date);
            const match = completionTrendRaw.find((item) => item.date === dateKey);
            completionTrend.push({ date: dateKey, count: match ? Number(match.count) : 0 });
        }
        const overdueTrend = [];
        for (let offset = 0; offset < 14; offset += 1) {
            const date = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
            const dateKey = this.formatDate(date);
            const match = overdueTrendRaw.find((item) => item.date === dateKey);
            overdueTrend.push({ date: dateKey, count: match ? Number(match.count) : 0 });
        }
        return {
            completionTrend,
            overdueTrend,
            priorityBreakdown: priorityBreakdown.map((row) => ({
                priority: row.priority,
                completed: Number(row.completed),
                open: Number(row.open),
            })),
            energyLevelBreakdown: energyLevelBreakdown.map((row) => ({
                energyLevel: row.energyLevel,
                count: Number(row.count),
            })),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map