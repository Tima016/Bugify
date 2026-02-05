export declare class Program {
    id: string;
    name: string;
    description: string;
    minReward: number;
    maxReward: number;
    status: string;
    scope: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Report {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    programId: string;
    researcherId: string;
    reward?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
    reputationScore: number;
    totalEarnings: number;
    isVerified: boolean;
    createdAt: Date;
}
export declare class PlatformStats {
    totalBountiesPaid: number;
    activePrograms: number;
    totalResearchers: number;
    vulnerabilitiesFixed: number;
}
export declare class LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    reputationScore: number;
    totalEarnings: number;
    validReports: number;
}
