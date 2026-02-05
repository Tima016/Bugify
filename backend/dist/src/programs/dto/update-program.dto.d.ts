import { CreateProgramDto } from './create-program.dto';
import { ProgramStatus } from '@prisma/client';
declare const UpdateProgramDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProgramDto>>;
export declare class UpdateProgramDto extends UpdateProgramDto_base {
    status?: ProgramStatus;
}
export {};
