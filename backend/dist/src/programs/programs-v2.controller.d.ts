export declare class ProgramsV2Controller {
    getPrograms(): Promise<{
        version: string;
        message: string;
        data: never[];
    }>;
    getProgram(id: string): Promise<{
        version: string;
        data: {
            id: string;
        };
    }>;
}
