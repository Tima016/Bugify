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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const SOFT_DELETE_MODELS = ['Company', 'Program', 'Report'];
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    constructor() {
        super();
        this.$use(async (params, next) => {
            if (SOFT_DELETE_MODELS.includes(params.model || '')) {
                if (params.action === 'findMany' || params.action === 'findFirst') {
                    if (!params.args)
                        params.args = {};
                    if (!params.args.where)
                        params.args.where = {};
                    if (params.args.where.deletedAt === undefined) {
                        params.args.where.deletedAt = null;
                    }
                }
                if (params.action === 'delete') {
                    params.action = 'update';
                    params.args.data = { deletedAt: new Date() };
                }
                if (params.action === 'deleteMany') {
                    params.action = 'updateMany';
                    if (!params.args)
                        params.args = {};
                    params.args.data = { deletedAt: new Date() };
                }
            }
            return next(params);
        });
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.log('Database connection established');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database connection closed');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map