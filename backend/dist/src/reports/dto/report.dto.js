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
exports.UpdateReportStatusDto = exports.CreateReportDto = void 0;
const class_validator_1 = require("class-validator");
class CreateReportDto {
    programId;
    title;
    vulnerabilityType;
    severity;
    cvssScore;
    cvssVector;
    description;
    impactAnalysis;
    reproductionSteps;
    proofOfConcept;
    discoveredDate;
    tags;
}
exports.CreateReportDto = CreateReportDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "programId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "vulnerabilityType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']),
    __metadata("design:type", String)
], CreateReportDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "cvssScore", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "cvssVector", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "impactAnalysis", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "reproductionSteps", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "proofOfConcept", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "discoveredDate", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateReportDto.prototype, "tags", void 0);
class UpdateReportStatusDto {
    status;
    internalNotes;
    bountyAmount;
    bonusAmount;
    currency;
}
exports.UpdateReportStatusDto = UpdateReportStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(['NEW', 'TRIAGED', 'NEEDS_MORE_INFO', 'ACCEPTED', 'DUPLICATE', 'INFORMATIVE', 'NOT_APPLICABLE', 'RESOLVED', 'CLOSED']),
    __metadata("design:type", String)
], UpdateReportStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReportStatusDto.prototype, "internalNotes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateReportStatusDto.prototype, "bountyAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateReportStatusDto.prototype, "bonusAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReportStatusDto.prototype, "currency", void 0);
//# sourceMappingURL=report.dto.js.map