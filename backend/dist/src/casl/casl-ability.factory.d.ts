import { PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import { User, Program, Report, Comment, Payment } from '@prisma/client';
type AppSubjects = Subjects<{
    User: User;
    Program: Program;
    Report: Report;
    Comment: Comment;
    Payment: Payment;
}> | 'all';
export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;
export declare class CaslAbilityFactory {
    createForUser(user: User): AppAbility;
}
export {};
