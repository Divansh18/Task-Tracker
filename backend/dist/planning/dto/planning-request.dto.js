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
exports.PlanningRequestDto = void 0;
const class_validator_1 = require("class-validator");
const task_energy_level_enum_1 = require("../../tasks/enums/task-energy-level.enum");
class PlanningRequestDto {
}
exports.PlanningRequestDto = PlanningRequestDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(600),
    __metadata("design:type", Number)
], PlanningRequestDto.prototype, "availableMinutes", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(task_energy_level_enum_1.TaskEnergyLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PlanningRequestDto.prototype, "energyLevel", void 0);
//# sourceMappingURL=planning-request.dto.js.map