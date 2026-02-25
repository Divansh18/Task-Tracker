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
const analytics_module_1 = require("./analytics/analytics.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const insights_module_1 = require("./insights/insights.module");
const planning_module_1 = require("./planning/planning.module");
let ProductivityModule = class ProductivityModule {
};
exports.ProductivityModule = ProductivityModule;
exports.ProductivityModule = ProductivityModule = __decorate([
    (0, common_1.Module)({
        imports: [analytics_module_1.AnalyticsModule, dashboard_module_1.DashboardModule, insights_module_1.InsightsModule, planning_module_1.PlanningModule],
    })
], ProductivityModule);
//# sourceMappingURL=productivity.module.js.map