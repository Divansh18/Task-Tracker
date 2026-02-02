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
exports.TaskActivityLog = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("./task.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const task_activity_type_enum_1 = require("../enums/task-activity-type.enum");
let TaskActivityLog = class TaskActivityLog {
};
exports.TaskActivityLog = TaskActivityLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskActivityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, (task) => task.activities, { onDelete: 'CASCADE' }),
    __metadata("design:type", task_entity_1.Task)
], TaskActivityLog.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', nullable: true }),
    __metadata("design:type", user_entity_1.User)
], TaskActivityLog.prototype, "actor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_activity_type_enum_1.TaskActivityType }),
    __metadata("design:type", String)
], TaskActivityLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TaskActivityLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskActivityLog.prototype, "createdAt", void 0);
exports.TaskActivityLog = TaskActivityLog = __decorate([
    (0, typeorm_1.Entity)({ name: 'task_activity_logs' }),
    (0, typeorm_1.Index)(['task'])
], TaskActivityLog);
//# sourceMappingURL=task-activity.entity.js.map