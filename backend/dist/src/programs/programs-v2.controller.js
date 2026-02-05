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
exports.ProgramsV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProgramsV2Controller = class ProgramsV2Controller {
    async getPrograms() {
        return {
            version: '2.0',
            message: 'Enhanced program listing with additional filters',
            data: [],
        };
    }
    async getProgram(id) {
        return {
            version: '2.0',
            data: { id },
        };
    }
};
exports.ProgramsV2Controller = ProgramsV2Controller;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Version)('2'),
    (0, swagger_1.ApiOperation)({ summary: 'Get programs (v2 - with enhanced filters)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProgramsV2Controller.prototype, "getPrograms", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.Version)('2'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get program by ID (v2)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgramsV2Controller.prototype, "getProgram", null);
exports.ProgramsV2Controller = ProgramsV2Controller = __decorate([
    (0, swagger_1.ApiTags)('programs-v2'),
    (0, common_1.Controller)({ path: 'programs', version: '2' })
], ProgramsV2Controller);
//# sourceMappingURL=programs-v2.controller.js.map