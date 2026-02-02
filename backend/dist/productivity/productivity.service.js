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
exports.ProductivityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../tasks/entities/task.entity");
const task_status_enum_1 = require("../tasks/enums/task-status.enum");
const task_energy_level_enum_1 = require("../tasks/enums/task-energy-level.enum");
const focus_service_1 = require("../focus/focus.service");
const reflections_service_1 = require("../reflections/reflections.service");
let ProductivityService = class ProductivityService {
    constructor(tasksRepository, focusService, reflectionsService) {
        this.tasksRepository = tasksRepository;
        this.focusService = focusService;
        this.reflectionsService = reflectionsService;
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
    calculateScore(details) {
        const completedContribution = Math.min(60, (details.completedToday / 5) * 60);
        const focusContribution = Math.min(30, details.focusCompleted * 10);
        const overduePenalty = Math.min(30, details.overdueCount * 10);
        const rawScore = Math.max(0, Math.min(100, Math.round(completedContribution + focusContribution - overduePenalty)));
        return {
            value: rawScore,
            breakdown: {
                base: Math.round(completedContribution),
                focus: Math.round(focusContribution),
                overduePenalty: Math.round(overduePenalty),
            },
            completedToday: details.completedToday,
            focusAssigned: details.focusAssigned,
            focusCompleted: details.focusCompleted,
            overdueCount: details.overdueCount,
        };
    }
    async calculateStreak(userId, today) {
        const completions = await this.tasksRepository
            .createQueryBuilder('task')
            .select('DATE(task.completedAt)', 'date')
            .addSelect('COUNT(task.id)', 'count')
            .where('task.userId = :userId', { userId })
            .andWhere('task.completedAt IS NOT NULL')
            .groupBy('DATE(task.completedAt)')
            .orderBy('DATE(task.completedAt)', 'DESC')
            .getRawMany();
        if (!completions.length) {
            return { current: 0, longest: 0 };
        }
        const dates = completions.map((item) => item.date);
        const dateSet = new Set(dates);
        let currentStreak = 0;
        let cursor = new Date(today);
        while (dateSet.has(this.formatDate(cursor))) {
            currentStreak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }
        let longestStreak = 0;
        let streakCounter = 0;
        let previousDate = null;
        const chronological = [...dates].sort();
        for (const dateString of chronological) {
            const currentDate = new Date(dateString);
            if (previousDate &&
                this.formatDate(new Date(previousDate.getTime() + 24 * 60 * 60 * 1000)) === this.formatDate(currentDate)) {
                streakCounter += 1;
            }
            else {
                streakCounter = 1;
            }
            longestStreak = Math.max(longestStreak, streakCounter);
            previousDate = currentDate;
        }
        const lastCompletedDate = dates[0];
        return {
            current: currentStreak,
            longest: longestStreak,
            lastCompletedDate,
        };
    }
    async getTodayDashboard(user) {
        const today = new Date();
        const todayStart = this.startOfDay(today);
        const todayEnd = this.endOfDay(today);
        const todayDate = this.formatDate(today);
        const [focusTasks, reflection] = await Promise.all([
            this.focusService.getFocusTasks(user, todayDate),
            this.reflectionsService.getReflection(user, todayDate),
        ]);
        const focusTaskIds = focusTasks.map((item) => item.task.id);
        const [totalTasks, completedToday, overdueCount, dueTodayTasks, upcomingTasks, overdueTasks, inProgressTasks,] = await Promise.all([
            this.tasksRepository.count({ where: { user: { id: user.id } } }),
            this.tasksRepository.count({
                where: {
                    user: { id: user.id },
                    completedAt: (0, typeorm_2.Between)(todayStart, todayEnd),
                },
            }),
            this.tasksRepository.count({
                where: {
                    user: { id: user.id },
                    status: (0, typeorm_2.Not)(task_status_enum_1.TaskStatus.Done),
                    dueDate: (0, typeorm_2.LessThan)(todayStart),
                },
            }),
            this.tasksRepository.find({
                where: {
                    user: { id: user.id },
                    status: (0, typeorm_2.Not)(task_status_enum_1.TaskStatus.Done),
                    dueDate: (0, typeorm_2.Between)(todayStart, todayEnd),
                },
                order: { dueDate: 'ASC' },
            }),
            this.tasksRepository.find({
                where: {
                    user: { id: user.id },
                    status: (0, typeorm_2.Not)(task_status_enum_1.TaskStatus.Done),
                    dueDate: (0, typeorm_2.Between)(this.startOfDay(new Date(today.getTime() + 24 * 60 * 60 * 1000)), this.endOfDay(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))),
                },
                order: { dueDate: 'ASC' },
            }),
            this.tasksRepository.find({
                where: {
                    user: { id: user.id },
                    status: (0, typeorm_2.Not)(task_status_enum_1.TaskStatus.Done),
                    dueDate: (0, typeorm_2.LessThan)(todayStart),
                },
                order: { dueDate: 'ASC' },
            }),
            this.tasksRepository.find({
                where: {
                    user: { id: user.id },
                    status: task_status_enum_1.TaskStatus.InProgress,
                },
                order: { updatedAt: 'DESC' },
                take: 5,
            }),
        ]);
        const focusCompleted = focusTasks.filter((focus) => focus.task.status === task_status_enum_1.TaskStatus.Done).length;
        const score = this.calculateScore({
            completedToday,
            focusAssigned: focusTasks.length,
            focusCompleted,
            overdueCount,
        });
        const streak = await this.calculateStreak(user.id, today);
        const energyBreakdown = await this.tasksRepository
            .createQueryBuilder('task')
            .select('task.energyLevel', 'energyLevel')
            .addSelect('SUM(CASE WHEN task.status = :done THEN 1 ELSE 0 END)', 'doneCount')
            .addSelect('SUM(CASE WHEN task.status = :inProgress THEN 1 ELSE 0 END)', 'inProgressCount')
            .addSelect('SUM(CASE WHEN task.status = :todo THEN 1 ELSE 0 END)', 'todoCount')
            .where('task.userId = :userId', { userId: user.id })
            .setParameters({
            done: task_status_enum_1.TaskStatus.Done,
            inProgress: task_status_enum_1.TaskStatus.InProgress,
            todo: task_status_enum_1.TaskStatus.Todo,
        })
            .groupBy('task.energyLevel')
            .getRawMany();
        const focusTasksDetailed = focusTasks.map((focus, index) => ({
            id: focus.id,
            focusDate: focus.focusDate,
            position: index,
            task: focus.task,
        }));
        return {
            date: todayDate,
            summary: {
                totalTasks,
                completedToday,
                overdueCount,
                inProgress: inProgressTasks.length,
                focusAssigned: focusTasks.length,
            },
            focus: {
                tasks: focusTasksDetailed,
                remainingSlots: Math.max(0, 3 - focusTasks.length),
            },
            streak,
            score,
            sections: {
                dueToday: dueTodayTasks,
                upcoming: upcomingTasks,
                overdue: overdueTasks,
                inProgress: inProgressTasks,
                focusTaskIds,
            },
            energyBreakdown: energyBreakdown.map((row) => ({
                energyLevel: row.energyLevel,
                done: Number(row.doneCount),
                inProgress: Number(row.inProgressCount),
                todo: Number(row.todoCount),
            })),
            reflection,
        };
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
    async getPlanningSuggestions(user, payload) {
        const tasks = await this.tasksRepository.find({
            where: {
                user: { id: user.id },
                status: (0, typeorm_2.Not)(task_status_enum_1.TaskStatus.Done),
            },
            order: { priority: 'DESC', createdAt: 'ASC' },
        });
        const filtered = payload.energyLevel
            ? tasks.filter((task) => task.energyLevel === payload.energyLevel)
            : tasks;
        const suggestions = [];
        let remaining = payload.availableMinutes;
        for (const task of filtered.sort((a, b) => {
            const estimateA = a.estimatedMinutes ?? 30;
            const estimateB = b.estimatedMinutes ?? 30;
            if (estimateA === estimateB) {
                return a.priority === b.priority ? 0 : a.priority > b.priority ? -1 : 1;
            }
            return estimateA - estimateB;
        })) {
            const estimate = task.estimatedMinutes ?? 30;
            if (estimate <= remaining) {
                suggestions.push(task);
                remaining -= estimate;
            }
            if (suggestions.length >= 5) {
                break;
            }
        }
        if (!suggestions.length) {
            return tasks.slice(0, 3);
        }
        return suggestions;
    }
};
exports.ProductivityService = ProductivityService;
exports.ProductivityService = ProductivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        focus_service_1.FocusService,
        reflections_service_1.ReflectionsService])
], ProductivityService);
//# sourceMappingURL=productivity.service.js.map