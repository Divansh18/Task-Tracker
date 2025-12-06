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
let TasksService = class TasksService {
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }
    async create(user, dto) {
        const task = this.tasksRepository.create({
            ...dto,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            user: { id: user.id },
        });
        return this.tasksRepository.save(task);
    }
    async findAll(user, filters) {
        const where = { user: { id: user.id } };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.search) {
            const searchTerm = `%${filters.search}%`;
            return this.tasksRepository.find({
                where: [
                    { ...where, title: (0, typeorm_2.Like)(searchTerm) },
                    { ...where, description: (0, typeorm_2.Like)(searchTerm) },
                ],
                order: { createdAt: 'DESC' },
            });
        }
        return this.tasksRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(user, id) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: { user: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.user.id !== user.id) {
            throw new common_1.ForbiddenException('You are not allowed to access this task');
        }
        return task;
    }
    async update(user, id, dto) {
        const task = await this.findOne(user, id);
        if (dto.dueDate !== undefined) {
            task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
        }
        Object.assign(task, {
            ...dto,
            dueDate: task.dueDate,
        });
        return this.tasksRepository.save(task);
    }
    async remove(user, id) {
        const task = await this.findOne(user, id);
        await this.tasksRepository.remove(task);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map