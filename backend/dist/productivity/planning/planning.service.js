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
exports.PlanningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../../tasks/entities/task.entity");
const task_status_enum_1 = require("../../tasks/enums/task-status.enum");
let PlanningService = class PlanningService {
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
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
exports.PlanningService = PlanningService;
exports.PlanningService = PlanningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlanningService);
//# sourceMappingURL=planning.service.js.map