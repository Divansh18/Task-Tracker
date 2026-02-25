"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSubtasksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const task_entity_1 = require("../tasks/entities/task.entity");
const task_subtask_entity_1 = require("../tasks/entities/task-subtask.entity");
const task_subtasks_service_1 = require("./task-subtasks.service");
const task_subtasks_controller_1 = require("./task-subtasks.controller");
const task_activity_module_1 = require("../task-activity/task-activity.module");
const tasks_module_1 = require("../tasks/tasks-module");
let TaskSubtasksModule = class TaskSubtasksModule {
};
exports.TaskSubtasksModule = TaskSubtasksModule;
exports.TaskSubtasksModule = TaskSubtasksModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, task_subtask_entity_1.TaskSubtask]), task_activity_module_1.TaskActivityModule, (0, common_1.forwardRef)(() => tasks_module_1.TasksModule)],
        providers: [task_subtasks_service_1.TaskSubtasksService],
        controllers: [task_subtasks_controller_1.TaskSubtasksController],
        exports: [task_subtasks_service_1.TaskSubtasksService],
    })
], TaskSubtasksModule);
//# sourceMappingURL=task-subtasks.module.js.map