"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCommentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const task_entity_1 = require("../tasks/entities/task.entity");
const task_comment_entity_1 = require("../tasks/entities/task-comment.entity");
const task_comments_service_1 = require("./task-comments.service");
const task_comments_controller_1 = require("./task-comments.controller");
const task_activity_module_1 = require("../task-activity/task-activity.module");
const tasks_module_1 = require("../tasks/tasks-module");
let TaskCommentsModule = class TaskCommentsModule {
};
exports.TaskCommentsModule = TaskCommentsModule;
exports.TaskCommentsModule = TaskCommentsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, task_comment_entity_1.TaskComment]), task_activity_module_1.TaskActivityModule, (0, common_1.forwardRef)(() => tasks_module_1.TasksModule)],
        providers: [task_comments_service_1.TaskCommentsService],
        controllers: [task_comments_controller_1.TaskCommentsController],
        exports: [task_comments_service_1.TaskCommentsService],
    })
], TaskCommentsModule);
//# sourceMappingURL=task-comments.module.js.map