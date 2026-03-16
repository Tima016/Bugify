// ============================================
// GraphQL Module — Hardened for Production
// Depth limiting, complexity analysis,
// introspection disabled in production
// ============================================
import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import depthLimit from 'graphql-depth-limit';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';
import { ProgramResolver, ReportResolver, UserResolver, StatsResolver } from './resolvers';
import { AppService } from '../app.service';
import { UsersService } from '../users/users.service';

const MAX_QUERY_DEPTH = 5;
const MAX_QUERY_COMPLEXITY = 100;
const isProduction = process.env.NODE_ENV === 'production';

@Module({
    imports: [
        NestGraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: isProduction ? true : join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,

            // CRITICAL: disable in production
            playground: !isProduction,
            introspection: !isProduction,

            // Depth limiting — prevents deeply nested query DoS
            validationRules: [depthLimit(MAX_QUERY_DEPTH)],

            // Query complexity analysis — prevents expensive queries
            plugins: [
                {
                    async requestDidStart() {
                        return {
                            async didResolveOperation({ request, document, schema }) {
                                const complexity = getComplexity({
                                    schema,
                                    operationName: request.operationName,
                                    query: document,
                                    variables: request.variables,
                                    estimators: [
                                        fieldExtensionsEstimator(),
                                        simpleEstimator({ defaultComplexity: 1 }),
                                    ],
                                });

                                if (complexity > MAX_QUERY_COMPLEXITY) {
                                    throw new Error(
                                        `Query is too complex: ${complexity}. Maximum allowed complexity: ${MAX_QUERY_COMPLEXITY}`,
                                    );
                                }
                            },
                        };
                    },
                },
            ],

            // Context injection for auth
            context: ({ req, res }) => ({ req, res }),

            // Timeout
            ...(isProduction && {
                csrfPrevention: true,
            }),
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
