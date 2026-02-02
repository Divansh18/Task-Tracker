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
exports.TaskSubtasksController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const tasks_service_1 = require("./tasks.service");
const task_subtasks_service_1 = require("./task-subtasks.service");
const create_subtask_dto_1 = require("./dto/create-subtask.dto");
const update_subtask_dto_1 = require("./dto/update-subtask.dto");
let TaskSubtasksController = class TaskSubtasksController {
    constructor(tasksService, subtasksService) {
        this.tasksService = tasksService;
        this.subtasksService = subtasksService;
    }
    async list(user, taskId) {
        const task = await this.tasksService.findOne(user, taskId);
        return this.subtasksService.list(task);
    }
    async create(user, taskId, dto) {
        const task = await this.tasksService.findOne(user, taskId);
        return this.subtasksService.create(task, user, dto);
    }
    async update(user, taskId, subtaskId, dto) {
        const task = await this.tasksService.findOne(user, taskId);
        return this.subtasksService.update(task, user, subtaskId, dto);
    }
    async remove(user, taskId, subtaskId) {
        const task = await this.tasksService.findOne(user, taskId);
        return this.subtasksService.remove(task, user, subtaskId);
    }
};
exports.TaskSubtasksController = TaskSubtasksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaskSubtasksController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_subtask_dto_1.CreateSubtaskDto]),
    __metadata("design:returntype", Promise)
], TaskSubtasksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':subtaskId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Param)('subtaskId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_subtask_dto_1.UpdateSubtaskDto]),
    __metadata("design:returntype", Promise)
], TaskSubtasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':subtaskId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Param)('subtaskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TaskSubtasksController.prototype, "remove", null);
exports.TaskSubtasksController = TaskSubtasksController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tasks/:taskId/subtasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService,
        task_subtasks_service_1.TaskSubtasksService])
], TaskSubtasksController);
//# sourceMappingURL=tasks.subtasks.controller.js.map