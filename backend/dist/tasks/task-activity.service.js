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
exports.TaskActivityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_activity_entity_1 = require("./entities/task-activity.entity");
let TaskActivityService = class TaskActivityService {
    constructor(activityRepository) {
        this.activityRepository = activityRepository;
    }
    async record(task, actor, type, metadata) {
        const activity = this.activityRepository.create({
            task: { id: task.id },
            actor: actor ? { id: actor.id } : null,
            type,
            metadata,
        });
        return this.activityRepository.save(activity);
    }
    async listForTask(task) {
        return this.activityRepository.find({
            where: { task: { id: task.id } },
            relations: { actor: true },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.TaskActivityService = TaskActivityService;
exports.TaskActivityService = TaskActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_activity_entity_1.TaskActivityLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaskActivityService);
//# sourceMappingURL=task-activity.service.js.map