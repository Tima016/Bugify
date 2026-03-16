"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const graphql_depth_limit_1 = __importDefault(require("graphql-depth-limit"));
const graphql_query_complexity_1 = require("graphql-query-complexity");
const resolvers_1 = require("./resolvers");
const app_service_1 = require("../app.service");
const users_service_1 = require("../users/users.service");
const MAX_QUERY_DEPTH = 5;
const MAX_QUERY_COMPLEXITY = 100;
const isProduction = process.env.NODE_ENV === 'production';
let GraphQLModule = class GraphQLModule {
};
exports.GraphQLModule = GraphQLModule;
exports.GraphQLModule = GraphQLModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: isProduction ? true : (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: !isProduction,
                introspection: !isProduction,
                validationRules: [(0, graphql_depth_limit_1.default)(MAX_QUERY_DEPTH)],
                plugins: [
                    {
                        async requestDidStart() {
                            return {
                                async didResolveOperation({ request, document, schema }) {
                                    const complexity = (0, graphql_query_complexity_1.getComplexity)({
                                        schema,
                                        operationName: request.operationName,
                                        query: document,
                                        variables: request.variables,
                                        estimators: [
                                            (0, graphql_query_complexity_1.fieldExtensionsEstimator)(),
                                            (0, graphql_query_complexity_1.simpleEstimator)({ defaultComplexity: 1 }),
                                        ],
                                    });
                                    if (complexity > MAX_QUERY_COMPLEXITY) {
                                        throw new Error(`Query is too complex: ${complexity}. Maximum allowed complexity: ${MAX_QUERY_COMPLEXITY}`);
                                    }
                                },
                            };
                        },
                    },
                ],
                context: ({ req, res }) => ({ req, res }),
                ...(isProduction && {
                    csrfPrevention: true,
                }),
            }),
        ],
        providers: [
            resolvers_1.ProgramResolver,
            resolvers_1.ReportResolver,
            resolvers_1.UserResolver,
            resolvers_1.StatsResolver,
            app_service_1.AppService,
            users_service_1.UsersService,
        ],
    })
], GraphQLModule);
//# sourceMappingURL=graphql.module.js.map