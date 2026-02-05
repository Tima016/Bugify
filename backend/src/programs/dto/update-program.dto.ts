import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramDto } from './create-program.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ProgramStatus } from '@prisma/client';

export class UpdateProgramDto extends PartialType(CreateProgramDto) {
    @IsEnum(ProgramStatus)
    @IsOptional()
    status?: ProgramStatus;
}
