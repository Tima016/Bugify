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
exports.LeaderboardEntry = exports.PlatformStats = exports.User = exports.Report = exports.Program = void 0;
const graphql_1 = require("@nestjs/graphql");
let Program = class Program {
    id;
    name;
    description;
    minReward;
    maxReward;
    status;
    scope;
    companyId;
    createdAt;
    updatedAt;
};
exports.Program = Program;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Program.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Program.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Program.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Program.prototype, "minReward", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Program.prototype, "maxReward", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Program.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Program.prototype, "scope", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Program.prototype, "companyId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Program.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Program.prototype, "updatedAt", void 0);
exports.Program = Program = __decorate([
    (0, graphql_1.ObjectType)()
], Program);
let Report = class Report {
    id;
    title;
    description;
    severity;
    status;
    programId;
    researcherId;
    reward;
    createdAt;
    updatedAt;
};
exports.Report = Report;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Report.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "programId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "researcherId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], Report.prototype, "reward", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Report.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Report.prototype, "updatedAt", void 0);
exports.Report = Report = __decorate([
    (0, graphql_1.ObjectType)()
], Report);
let User = class User {
    id;
    email;
    username;
    firstName;
    lastName;
    role;
    reputationScore;
    totalEarnings;
    isVerified;
    createdAt;
};
exports.User = User;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], User.prototype, "reputationScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], User.prototype, "totalEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
exports.User = User = __decorate([
    (0, graphql_1.ObjectType)()
], User);
let PlatformStats = class PlatformStats {
    totalBountiesPaid;
    activePrograms;
    totalResearchers;
    vulnerabilitiesFixed;
};
exports.PlatformStats = PlatformStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PlatformStats.prototype, "totalBountiesPaid", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PlatformStats.prototype, "activePrograms", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PlatformStats.prototype, "totalResearchers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PlatformStats.prototype, "vulnerabilitiesFixed", void 0);
exports.PlatformStats = PlatformStats = __decorate([
    (0, graphql_1.ObjectType)()
], PlatformStats);
let LeaderboardEntry = class LeaderboardEntry {
    rank;
    userId;
    username;
    reputationScore;
    totalEarnings;
    validReports;
};
exports.LeaderboardEntry = LeaderboardEntry;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "rank", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LeaderboardEntry.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LeaderboardEntry.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "reputationScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "totalEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "validReports", void 0);
exports.LeaderboardEntry = LeaderboardEntry = __decorate([
    (0, graphql_1.ObjectType)()
], LeaderboardEntry);
//# sourceMappingURL=index.js.map