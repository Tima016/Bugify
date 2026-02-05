import { OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';
export declare class SearchService implements OnModuleInit {
    private readonly elasticsearchService;
    private readonly prisma;
    private readonly logger;
    private isElasticsearchAvailable;
    constructor(elasticsearchService: ElasticsearchService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private createIndices;
    private getIndexMapping;
    indexProgram(programId: string): Promise<void>;
    indexReport(reportId: string): Promise<void>;
    searchPrograms(query: string, filters?: any): Promise<any[]>;
    searchReports(query: string, filters?: any): Promise<any[]>;
    deleteProgram(programId: string): Promise<void>;
    deleteReport(reportId: string): Promise<void>;
    reindexPrograms(): Promise<void>;
    reindexReports(): Promise<void>;
}
