export declare class CreateCommentDto {
    reportId: string;
    content: string;
    attachments?: any[];
    parentCommentId?: string;
    isInternal?: boolean;
}
export declare class UpdateCommentDto {
    content: string;
}
