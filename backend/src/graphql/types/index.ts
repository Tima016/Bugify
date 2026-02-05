import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Program {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    description: string;

    @Field(() => Float)
    minReward: number;

    @Field(() => Float)
    maxReward: number;

    @Field()
    status: string;

    @Field()
    scope: string;

    @Field()
    companyId: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@ObjectType()
export class Report {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    description: string;

    @Field()
    severity: string;

    @Field()
    status: string;

    @Field()
    programId: string;

    @Field()
    researcherId: string;

    @Field({ nullable: true })
    reward?: number;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@ObjectType()
export class User {
    @Field(() => ID)
    id: string;

    @Field()
    email: string;

    @Field()
    username: string;

    @Field({ nullable: true })
    firstName?: string;

    @Field({ nullable: true })
    lastName?: string;

    @Field()
    role: string;

    @Field(() => Int)
    reputationScore: number;

    @Field(() => Float)
    totalEarnings: number;

    @Field()
    isVerified: boolean;

    @Field()
    createdAt: Date;
}

@ObjectType()
export class PlatformStats {
    @Field(() => Float)
    totalBountiesPaid: number;

    @Field(() => Int)
    activePrograms: number;

    @Field(() => Int)
    totalResearchers: number;

    @Field(() => Int)
    vulnerabilitiesFixed: number;
}

@ObjectType()
export class LeaderboardEntry {
    @Field(() => Int)
    rank: number;

    @Field()
    userId: string;

    @Field()
    username: string;

    @Field(() => Int)
    reputationScore: number;

    @Field(() => Float)
    totalEarnings: number;

    @Field(() => Int)
    validReports: number;
}
