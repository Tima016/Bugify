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
exports.CreateProgramDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateProgramDto {
    programName;
    description;
    programType;
    targetTypes;
    vulnerabilityTypes;
    scope;
    outOfScope;
    rulesAndGuidelines;
    safeHarborPolicy;
    disclosurePolicy;
    minimumPayout;
    maximumPayout;
    currency = 'USD';
    hallOfFameEnabled = true;
    swagRewardsAvailable = false;
}
exports.CreateProgramDto = CreateProgramDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "programName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ProgramType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "programType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProgramDto.prototype, "targetTypes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProgramDto.prototype, "vulnerabilityTypes", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreateProgramDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateProgramDto.prototype, "outOfScope", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "rulesAndGuidelines", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "safeHarborPolicy", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DisclosurePolicy),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "disclosurePolicy", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProgramDto.prototype, "minimumPayout", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProgramDto.prototype, "maximumPayout", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProgramDto.prototype, "hallOfFameEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProgramDto.prototype, "swagRewardsAvailable", void 0);
//# sourceMappingURL=create-program.dto.js.map