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
exports.TaskCommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_comment_entity_1 = require("./entities/task-comment.entity");
const task_activity_service_1 = require("./task-activity.service");
const task_activity_type_enum_1 = require("./enums/task-activity-type.enum");
let TaskCommentsService = class TaskCommentsService {
    constructor(commentsRepository, activityService) {
        this.commentsRepository = commentsRepository;
        this.activityService = activityService;
    }
    async list(task) {
        return this.commentsRepository.find({
            where: { task: { id: task.id } },
            relations: { author: true },
            order: { createdAt: 'ASC' },
        });
    }
    async create(task, user, dto) {
        const comment = this.commentsRepository.create({
            content: dto.content.trim(),
            task: { id: task.id },
            author: { id: user.id },
        });
        await this.commentsRepository.save(comment);
        await this.activityService.record(task, user, task_activity_type_enum_1.TaskActivityType.CommentAdded, {
            commentId: comment.id,
        });
        return this.list(task);
    }
};
exports.TaskCommentsService = TaskCommentsService;
exports.TaskCommentsService = TaskCommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_comment_entity_1.TaskComment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        task_activity_service_1.TaskActivityService])
], TaskCommentsService);
//# sourceMappingURL=task-comments.service.js.map