// ============================================
// Prisma Service — Enhanced with Soft-Delete Middleware
// Auto-filters deleted records on find queries
// Converts delete to soft-delete for enabled models
// ============================================
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

// Models that support soft-delete
const SOFT_DELETE_MODELS = ['Company', 'Program', 'Report'];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super();

        // Soft-delete middleware: intercept find queries to filter deleted records
        this.$use(async (params: Prisma.MiddlewareParams, next) => {
            if (SOFT_DELETE_MODELS.includes(params.model || '')) {
                // Auto-filter on find operations
                if (params.action === 'findMany' || params.action === 'findFirst') {
                    if (!params.args) params.args = {};
                    if (!params.args.where) params.args.where = {};

                    // Only filter if not explicitly querying deleted records
                    if (params.args.where.deletedAt === undefined) {
                        params.args.where.deletedAt = null;
                    }
                }

                // Convert delete to soft-delete
                if (params.action === 'delete') {
                    params.action = 'update';
                    params.args.data = { deletedAt: new Date() };
                }

                // Convert deleteMany to soft-delete
                if (params.action === 'deleteMany') {
                    params.action = 'updateMany';
                    if (!params.args) params.args = {};
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
}
