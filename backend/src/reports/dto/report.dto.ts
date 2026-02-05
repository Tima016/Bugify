import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';

export class CreateReportDto {
    @IsString()
    programId: string;

    @IsString()
    title: string;

    @IsString()
    vulnerabilityType: string;

    @IsEnum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'])
    severity: string;

    @IsNumber()
    @IsOptional()
    cvssScore?: number;

    @IsString()
    @IsOptional()
    cvssVector?: string;

    @IsString()
    description: string;

    @IsString()
    impactAnalysis: string;

    @IsString()
    reproductionSteps: string;

    @IsString()
    @IsOptional()
    proofOfConcept?: string;

    @IsDateString()
    discoveredDate: string;

    @IsArray()
    @IsOptional()
    tags?: string[];
}

export class UpdateReportStatusDto {
    @IsEnum(['NEW', 'TRIAGED', 'NEEDS_MORE_INFO', 'ACCEPTED', 'DUPLICATE', 'INFORMATIVE', 'NOT_APPLICABLE', 'RESOLVED', 'CLOSED'])
    status: string;

    @IsString()
    @IsOptional()
    internalNotes?: string;

    @IsNumber()
    @IsOptional()
    bountyAmount?: number;

    @IsNumber()
    @IsOptional()
    bonusAmount?: number;

    @IsString()
    @IsOptional()
    currency?: string;
}
