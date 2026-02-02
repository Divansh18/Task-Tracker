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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("../../tasks/entities/task.entity");
const task_comment_entity_1 = require("../../tasks/entities/task-comment.entity");
const task_activity_entity_1 = require("../../tasks/entities/task-activity.entity");
const focus_task_entity_1 = require("../../focus/entities/focus-task.entity");
const daily_reflection_entity_1 = require("../../reflections/entities/daily-reflection.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_comment_entity_1.TaskComment, (comment) => comment.author),
    __metadata("design:type", Array)
], User.prototype, "taskComments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_activity_entity_1.TaskActivityLog, (activity) => activity.actor),
    __metadata("design:type", Array)
], User.prototype, "taskActivities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => focus_task_entity_1.FocusTask, (focusTask) => focusTask.user),
    __metadata("design:type", Array)
], User.prototype, "focusTasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => daily_reflection_entity_1.DailyReflection, (reflection) => reflection.user),
    __metadata("design:type", Array)
], User.prototype, "reflections", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], User);
//# sourceMappingURL=user.entity.js.map