import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProgramType, DisclosurePolicy } from '@prisma/client';

export class CreateProgramDto {
    @IsString()
    @IsNotEmpty()
    programName: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(ProgramType)
    @IsNotEmpty()
    programType: ProgramType;

    @IsArray()
    @IsString({ each: true })
    targetTypes: string[];

    @IsArray()
    @IsString({ each: true })
    vulnerabilityTypes: string[];

    @IsNotEmpty()
    scope: any; // JSON object validation can be complex, keeping broad for now

    @IsOptional()
    outOfScope: any;

    @IsOptional()
    @IsString()
    rulesAndGuidelines: string;

    @IsOptional()
    @IsString()
    safeHarborPolicy: string;

    @IsEnum(DisclosurePolicy)
    @IsOptional()
    disclosurePolicy: DisclosurePolicy;

    @IsNumber()
    @Min(0)
    @IsOptional()
    minimumPayout: number;

    @IsNumber()
    @Min(0)
    maximumPayout: number;

    @IsString()
    @IsOptional()
    currency: string = 'USD';

    @IsBoolean()
    @IsOptional()
    hallOfFameEnabled: boolean = true;

    @IsBoolean()
    @IsOptional()
    swagRewardsAvailable: boolean = false;
}
