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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = SearchService_1 = class SearchService {
    elasticsearchService;
    prisma;
    logger = new common_1.Logger(SearchService_1.name);
    isElasticsearchAvailable = true;
    constructor(elasticsearchService, prisma) {
        this.elasticsearchService = elasticsearchService;
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.createIndices();
        }
        catch (error) {
            this.isElasticsearchAvailable = false;
            this.logger.warn(`⚠ Elasticsearch not available, search functionality disabled for development. Error: ${error.message}`);
        }
    }
    async createIndices() {
        const indices = ['programs', 'reports'];
        for (const index of indices) {
            const exists = await this.elasticsearchService.indices.exists({ index });
            if (!exists) {
                await this.elasticsearchService.indices.create({
                    index,
                    body: this.getIndexMapping(index),
                });
            }
        }
    }
    getIndexMapping(index) {
        const mappings = {
            programs: {
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        name: { type: 'text', analyzer: 'standard' },
                        description: { type: 'text', analyzer: 'standard' },
                        companyName: { type: 'text', analyzer: 'standard' },
                        scope: { type: 'text', analyzer: 'standard' },
                        status: { type: 'keyword' },
                        minReward: { type: 'float' },
                        maxReward: { type: 'float' },
                        createdAt: { type: 'date' },
                    },
                },
            },
            reports: {
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        title: { type: 'text', analyzer: 'standard' },
                        description: { type: 'text', analyzer: 'standard' },
                        severity: { type: 'keyword' },
                        status: { type: 'keyword' },
                        programId: { type: 'keyword' },
                        researcherId: { type: 'keyword' },
                        createdAt: { type: 'date' },
                    },
                },
            },
        };
        return mappings[index] || {};
    }
    async indexProgram(programId) {
        if (!this.isElasticsearchAvailable)
            return;
        const program = await this.prisma.program.findUnique({
            where: { id: programId },
            include: {
                company: {
                    select: {
                        companyName: true,
                    },
                },
            },
        });
        if (!program)
            return;
        await this.elasticsearchService.index({
            index: 'programs',
            id: program.id,
            document: {
                id: program.id,
                name: program.programName,
                description: program.description,
                companyName: program.company.companyName,
                scope: program.scope,
                status: program.status,
                minReward: program.minimumPayout,
                maxReward: program.maximumPayout,
                createdAt: program.createdAt,
            },
        });
    }
    async indexReport(reportId) {
        if (!this.isElasticsearchAvailable)
            return;
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report)
            return;
        await this.elasticsearchService.index({
            index: 'reports',
            id: report.id,
            document: {
                id: report.id,
                title: report.title,
                description: report.description,
                severity: report.severity,
                status: report.status,
                programId: report.programId,
                researcherId: report.researcherId,
                createdAt: report.createdAt,
            },
        });
    }
    async searchPrograms(query, filters) {
        if (!this.isElasticsearchAvailable) {
            return [];
        }
        const must = [];
        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['name^3', 'description^2', 'companyName^2', 'scope'],
                    fuzziness: 'AUTO',
                },
            });
        }
        if (filters?.status) {
            must.push({ term: { status: filters.status } });
        }
        if (filters?.minReward) {
            must.push({ range: { minReward: { gte: filters.minReward } } });
        }
        const result = await this.elasticsearchService.search({
            index: 'programs',
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }],
                },
            },
            sort: [{ createdAt: { order: 'desc' } }],
            size: 20,
        });
        return result.hits.hits.map((hit) => ({
            id: hit._id,
            score: hit._score,
            ...hit._source,
        }));
    }
    async searchReports(query, filters) {
        if (!this.isElasticsearchAvailable) {
            return [];
        }
        const must = [];
        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['title^3', 'description^2'],
                    fuzziness: 'AUTO',
                },
            });
        }
        if (filters?.severity) {
            must.push({ term: { severity: filters.severity } });
        }
        if (filters?.status) {
            must.push({ term: { status: filters.status } });
        }
        if (filters?.programId) {
            must.push({ term: { programId: filters.programId } });
        }
        const result = await this.elasticsearchService.search({
            index: 'reports',
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }],
                },
            },
            sort: [{ createdAt: { order: 'desc' } }],
            size: 20,
        });
        return result.hits.hits.map((hit) => ({
            id: hit._id,
            score: hit._score,
            ...hit._source,
        }));
    }
    async deleteProgram(programId) {
        try {
            await this.elasticsearchService.delete({
                index: 'programs',
                id: programId,
            });
        }
        catch (error) {
        }
    }
    async deleteReport(reportId) {
        try {
            await this.elasticsearchService.delete({
                index: 'reports',
                id: reportId,
            });
        }
        catch (error) {
        }
    }
    async reindexPrograms() {
        const programs = await this.prisma.program.findMany({
            include: {
                company: {
                    select: {
                        companyName: true,
                    },
                },
            },
        });
        const operations = programs.flatMap((program) => [
            { index: { _index: 'programs', _id: program.id } },
            {
                id: program.id,
                name: program.programName,
                description: program.description,
                companyName: program.company.companyName,
                scope: program.scope,
                status: program.status,
                minReward: program.minimumPayout,
                maxReward: program.maximumPayout,
                createdAt: program.createdAt,
            },
        ]);
        if (operations.length > 0) {
            await this.elasticsearchService.bulk({ operations });
        }
    }
    async reindexReports() {
        const reports = await this.prisma.report.findMany();
        const operations = reports.flatMap((report) => [
            { index: { _index: 'reports', _id: report.id } },
            {
                id: report.id,
                title: report.title,
                description: report.description,
                severity: report.severity,
                status: report.status,
                programId: report.programId,
                researcherId: report.researcherId,
                createdAt: report.createdAt,
            },
        ]);
        if (operations.length > 0) {
            await this.elasticsearchService.bulk({ operations });
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService,
        prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map