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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const daily_reflection_entity_1 = require("./entities/daily-reflection.entity");
let ReflectionsService = class ReflectionsService {
    constructor(reflectionRepository) {
        this.reflectionRepository = reflectionRepository;
    }
    normalizeDate(date) {
        if (date) {
            return new Date(date).toISOString().slice(0, 10);
        }
        return new Date().toISOString().slice(0, 10);
    }
    async getReflection(user, date) {
        const reflectDate = this.normalizeDate(date);
        return this.reflectionRepository.findOne({
            where: { user: { id: user.id }, reflectDate },
        });
    }
    async upsertReflection(user, dto) {
        const reflectDate = this.normalizeDate(dto.date);
        let reflection = await this.reflectionRepository.findOne({
            where: { user: { id: user.id }, reflectDate },
        });
        const payload = {
            wentWell: dto.wentWell?.trim() || null,
            blockers: dto.blockers?.trim() || null,
            winOfDay: dto.winOfDay?.trim() || null,
        };
        if (reflection) {
            Object.assign(reflection, payload);
        }
        else {
            reflection = this.reflectionRepository.create({
                user: { id: user.id },
                reflectDate,
                ...payload,
            });
        }
        return this.reflectionRepository.save(reflection);
    }
};
exports.ReflectionsService = ReflectionsService;
exports.ReflectionsService = ReflectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_reflection_entity_1.DailyReflection)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReflectionsService);
//# sourceMappingURL=reflections.service.js.map