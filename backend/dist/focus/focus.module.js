"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const focus_task_entity_1 = require("./entities/focus-task.entity");
const focus_service_1 = require("./focus.service");
const focus_controller_1 = require("./focus.controller");
const task_entity_1 = require("../tasks/entities/task.entity");
const tasks_module_1 = require("../tasks/tasks.module");
let FocusModule = class FocusModule {
};
exports.FocusModule = FocusModule;
exports.FocusModule = FocusModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([focus_task_entity_1.FocusTask, task_entity_1.Task]), (0, common_1.forwardRef)(() => tasks_module_1.TasksModule)],
        controllers: [focus_controller_1.FocusController],
        providers: [focus_service_1.FocusService],
        exports: [focus_service_1.FocusService],
    })
], FocusModule);
//# sourceMappingURL=focus.module.js.map