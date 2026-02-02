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
exports.TaskCommentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const tasks_service_1 = require("./tasks.service");
const task_comments_service_1 = require("./task-comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
let TaskCommentsController = class TaskCommentsController {
    constructor(tasksService, commentsService) {
        this.tasksService = tasksService;
        this.commentsService = commentsService;
    }
    async list(user, taskId) {
        const task = await this.tasksService.findOne(user, taskId);
        return this.commentsService.list(task);
    }
    async create(user, taskId, dto) {
        const task = await this.tasksService.findOne(user, taskId);
        return this.commentsService.create(task, user, dto);
    }
};
exports.TaskCommentsController = TaskCommentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaskCommentsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], TaskCommentsController.prototype, "create", null);
exports.TaskCommentsController = TaskCommentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tasks/:taskId/comments'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService,
        task_comments_service_1.TaskCommentsService])
], TaskCommentsController);
//# sourceMappingURL=tasks.comments.controller.js.map