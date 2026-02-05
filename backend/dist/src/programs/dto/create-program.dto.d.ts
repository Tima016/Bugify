import { ProgramType, DisclosurePolicy } from '@prisma/client';
export declare class CreateProgramDto {
    programName: string;
    description: string;
    programType: ProgramType;
    targetTypes: string[];
    vulnerabilityTypes: string[];
    scope: any;
    outOfScope: any;
    rulesAndGuidelines: string;
    safeHarborPolicy: string;
    disclosurePolicy: DisclosurePolicy;
    minimumPayout: number;
    maximumPayout: number;
    currency: string;
    hallOfFameEnabled: boolean;
    swagRewardsAvailable: boolean;
}
