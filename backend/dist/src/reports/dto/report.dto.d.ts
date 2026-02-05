export declare class CreateReportDto {
    programId: string;
    title: string;
    vulnerabilityType: string;
    severity: string;
    cvssScore?: number;
    cvssVector?: string;
    description: string;
    impactAnalysis: string;
    reproductionSteps: string;
    proofOfConcept?: string;
    discoveredDate: string;
    tags?: string[];
}
export declare class UpdateReportStatusDto {
    status: string;
    internalNotes?: string;
    bountyAmount?: number;
    bonusAmount?: number;
    currency?: string;
}
