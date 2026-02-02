"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const daily_reflection_entity_1 = require("./entities/daily-reflection.entity");
const reflections_service_1 = require("./reflections.service");
const reflections_controller_1 = require("./reflections.controller");
let ReflectionsModule = class ReflectionsModule {
};
exports.ReflectionsModule = ReflectionsModule;
exports.ReflectionsModule = ReflectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([daily_reflection_entity_1.DailyReflection])],
        providers: [reflections_service_1.ReflectionsService],
        controllers: [reflections_controller_1.ReflectionsController],
        exports: [reflections_service_1.ReflectionsService],
    })
], ReflectionsModule);
//# sourceMappingURL=reflections.module.js.map