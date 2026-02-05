import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    reportId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsArray()
    @IsOptional()
    attachments?: any[];

    @IsString()
    @IsOptional()
    parentCommentId?: string;

    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;
}

export class UpdateCommentDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}
