import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly logger = new Logger(SearchService.name);
    private isElasticsearchAvailable = true;

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly prisma: PrismaService,
    ) { }

    async onModuleInit() {
        // Create indices if they don't exist
        try {
            await this.createIndices();
        } catch (error) {
            this.isElasticsearchAvailable = false;
            this.logger.warn(
                `⚠ Elasticsearch not available, search functionality disabled for development. Error: ${error.message}`,
            );
        }
    }

    private async createIndices() {
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

    private getIndexMapping(index: string) {
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

    /**
     * Index a program
     */
    async indexProgram(programId: string) {
        if (!this.isElasticsearchAvailable) return;

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

        if (!program) return;

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

    /**
     * Index a report
     */
    async indexReport(reportId: string) {
        if (!this.isElasticsearchAvailable) return;

        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });

        if (!report) return;

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

    /**
     * Search programs
     */
    async searchPrograms(query: string, filters?: any) {
        if (!this.isElasticsearchAvailable) {
            return []; // Return empty results if Elasticsearch not available
        }

        const must: any[] = [];

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

        const result = await this.elasticsearchService.search<any>({
            index: 'programs',
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }],
                },
            },
            sort: [{ createdAt: { order: 'desc' } }],
            size: 20,
        } as any);

        return result.hits.hits.map((hit: any) => ({
            id: hit._id,
            score: hit._score,
            ...hit._source,
        }));
    }

    /**
     * Search reports
     */
    async searchReports(query: string, filters?: any) {
        if (!this.isElasticsearchAvailable) {
            return []; // Return empty results if Elasticsearch not available
        }

        const must: any[] = [];

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

        const result = await this.elasticsearchService.search<any>({
            index: 'reports',
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }],
                },
            },
            sort: [{ createdAt: { order: 'desc' } }],
            size: 20,
        } as any);

        return result.hits.hits.map((hit: any) => ({
            id: hit._id,
            score: hit._score,
            ...hit._source,
        }));
    }

    /**
     * Delete program from index
     */
    async deleteProgram(programId: string) {
        try {
            await this.elasticsearchService.delete({
                index: 'programs',
                id: programId,
            });
        } catch (error) {
            // Ignore if document doesn't exist
        }
    }

    /**
     * Delete report from index
     */
    async deleteReport(reportId: string) {
        try {
            await this.elasticsearchService.delete({
                index: 'reports',
                id: reportId,
            });
        } catch (error) {
            // Ignore if document doesn't exist
        }
    }

    /**
     * Bulk index all programs
     */
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

    /**
     * Bulk index all reports
     */
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
}
