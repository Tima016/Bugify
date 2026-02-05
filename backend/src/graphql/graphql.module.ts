import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProgramResolver, ReportResolver, UserResolver, StatsResolver } from './resolvers';
import { AppService } from '../app.service';
import { UsersService } from '../users/users.service';

@Module({
    imports: [
        NestGraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: true,
            introspection: true,
        }),
    ],
    providers: [
        ProgramResolver,
        ReportResolver,
        UserResolver,
        StatsResolver,
        AppService,
        UsersService,
    ],
})
export class GraphQLModule { }
