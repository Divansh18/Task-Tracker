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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const task_priority_enum_1 = require("../enums/task-priority.enum");
const task_status_enum_1 = require("../enums/task-status.enum");
const task_energy_level_enum_1 = require("../enums/task-energy-level.enum");
const task_subtask_entity_1 = require("./task-subtask.entity");
const task_comment_entity_1 = require("./task-comment.entity");
const task_activity_entity_1 = require("./task-activity.entity");
const focus_task_entity_1 = require("../../focus/entities/focus-task.entity");
let Task = class Task {
};
exports.Task = Task;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Task.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_priority_enum_1.TaskPriority, default: task_priority_enum_1.TaskPriority.Medium }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_status_enum_1.TaskStatus, default: task_status_enum_1.TaskStatus.Todo }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_energy_level_enum_1.TaskEnergyLevel, default: task_energy_level_enum_1.TaskEnergyLevel.Medium }),
    __metadata("design:type", String)
], Task.prototype, "energyLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Task.prototype, "estimatedMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.tasks, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Task.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_subtask_entity_1.TaskSubtask, (subtask) => subtask.task, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Task.prototype, "subtasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_comment_entity_1.TaskComment, (comment) => comment.task, {
        cascade: ['remove'],
    }),
    __metadata("design:type", Array)
], Task.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_activity_entity_1.TaskActivityLog, (activity) => activity.task, {
        cascade: ['remove'],
    }),
    __metadata("design:type", Array)
], Task.prototype, "activities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => focus_task_entity_1.FocusTask, (focusTask) => focusTask.task, {
        cascade: ['remove'],
    }),
    __metadata("design:type", Array)
], Task.prototype, "focusAssignments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
exports.Task = Task = __decorate([
    (0, typeorm_1.Entity)({ name: 'tasks' }),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['priority']),
    (0, typeorm_1.Index)(['title'])
], Task);
//# sourceMappingURL=task.entity.js.map