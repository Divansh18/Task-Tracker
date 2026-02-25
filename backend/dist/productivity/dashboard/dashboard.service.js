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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../../tasks/entities/task.entity");
const task_status_enum_1 = require("../../tasks/enums/task-status.enum");
const focus_service_1 = require("../../focus/focus.service");
const reflections_service_1 = require("../../reflections/reflections.service");
let DashboardService = class DashboardService {
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
        const dates = completions.map((c) => c.date).sort();
        let current = 0;
        let longest = 0;
        let temp = 0;
        const todayStr = this.formatDate(today);
        for (let i = dates.length - 1; i >= 0; i--) {
            const date = dates[i];
            if (date === todayStr || date === this.formatDate(new Date(today.getTime() - (dates.length - 1 - i) * 24 * 60 * 60 * 1000))) {
                temp++;
            }
            else {
                longest = Math.max(longest, temp);
                temp = 1;
            }
        }
        longest = Math.max(longest, temp);
        const lastCompletion = dates[dates.length - 1];
        if (lastCompletion === todayStr) {
            current = temp;
        }
        else {
            const daysDiff = Math.floor((today.getTime() - new Date(lastCompletion).getTime()) / (24 * 60 * 60 * 1000));
            if (daysDiff <= 1) {
                current = temp;
            }
        }
        return { current, longest, lastCompletedDate: dates[dates.length - 1] };
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        focus_service_1.FocusService,
        reflections_service_1.ReflectionsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map