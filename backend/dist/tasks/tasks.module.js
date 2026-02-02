"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const task_entity_1 = require("./entities/task.entity");
const tasks_controller_1 = require("./tasks.controller");
const tasks_service_1 = require("./tasks.service");
const task_subtask_entity_1 = require("./entities/task-subtask.entity");
const task_comment_entity_1 = require("./entities/task-comment.entity");
const task_activity_entity_1 = require("./entities/task-activity.entity");
const task_subtasks_service_1 = require("./task-subtasks.service");
const task_comments_service_1 = require("./task-comments.service");
const task_activity_service_1 = require("./task-activity.service");
const tasks_subtasks_controller_1 = require("./tasks.subtasks.controller");
const tasks_comments_controller_1 = require("./tasks.comments.controller");
const tasks_activity_controller_1 = require("./tasks.activity.controller");
const focus_module_1 = require("../focus/focus.module");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, task_subtask_entity_1.TaskSubtask, task_comment_entity_1.TaskComment, task_activity_entity_1.TaskActivityLog]),
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => focus_module_1.FocusModule),
        ],
        controllers: [tasks_controller_1.TasksController, tasks_subtasks_controller_1.TaskSubtasksController, tasks_comments_controller_1.TaskCommentsController, tasks_activity_controller_1.TaskActivityController],
        providers: [tasks_service_1.TasksService, task_subtasks_service_1.TaskSubtasksService, task_comments_service_1.TaskCommentsService, task_activity_service_1.TaskActivityService],
        exports: [tasks_service_1.TasksService, task_activity_service_1.TaskActivityService],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map