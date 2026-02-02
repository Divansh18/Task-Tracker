"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductivityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const task_entity_1 = require("../tasks/entities/task.entity");
const productivity_service_1 = require("./productivity.service");
const dashboard_controller_1 = require("./dashboard.controller");
const insights_controller_1 = require("./insights.controller");
const analytics_controller_1 = require("./analytics.controller");
const planning_controller_1 = require("./planning.controller");
const focus_module_1 = require("../focus/focus.module");
const reflections_module_1 = require("../reflections/reflections.module");
let ProductivityModule = class ProductivityModule {
};
exports.ProductivityModule = ProductivityModule;
exports.ProductivityModule = ProductivityModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task]), focus_module_1.FocusModule, reflections_module_1.ReflectionsModule],
        providers: [productivity_service_1.ProductivityService],
        controllers: [dashboard_controller_1.DashboardController, insights_controller_1.InsightsController, analytics_controller_1.AnalyticsController, planning_controller_1.PlanningController],
    })
], ProductivityModule);
//# sourceMappingURL=productivity.module.js.map