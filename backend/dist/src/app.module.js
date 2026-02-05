"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const email_module_1 = require("./email/email.module");
const storage_module_1 = require("./storage/storage.module");
const queue_module_1 = require("./queue/queue.module");
const search_module_1 = require("./search/search.module");
const casl_module_1 = require("./casl/casl.module");
const graphql_module_1 = require("./graphql/graphql.module");
const invitation_module_1 = require("./invitation/invitation.module");
const achievements_module_1 = require("./achievements/achievements.module");
const leaderboard_module_1 = require("./leaderboard/leaderboard.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const sms_module_1 = require("./sms/sms.module");
const ai_module_1 = require("./ai/ai.module");
const tax_module_1 = require("./tax/tax.module");
const pdf_module_1 = require("./pdf/pdf.module");
const auth_module_1 = require("./auth/auth.module");
const programs_module_1 = require("./programs/programs.module");
const reports_module_1 = require("./reports/reports.module");
const notifications_module_1 = require("./notifications/notifications.module");
const users_module_1 = require("./users/users.module");
const payments_module_1 = require("./payments/payments.module");
const comments_module_1 = require("./comments/comments.module");
const invoices_module_1 = require("./invoices/invoices.module");
const companies_module_1 = require("./companies/companies.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            redis_module_1.RedisModule,
            email_module_1.EmailModule,
            storage_module_1.StorageModule,
            queue_module_1.QueueModule,
            search_module_1.SearchModule,
            casl_module_1.CaslModule,
            graphql_module_1.GraphQLModule,
            invitation_module_1.InvitationModule,
            achievements_module_1.AchievementsModule,
            leaderboard_module_1.LeaderboardModule,
            webhooks_module_1.WebhooksModule,
            sms_module_1.SMSModule,
            ai_module_1.AIModule,
            tax_module_1.TaxModule,
            pdf_module_1.PDFModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            programs_module_1.ProgramsModule,
            reports_module_1.ReportsModule,
            notifications_module_1.NotificationsModule,
            users_module_1.UsersModule,
            payments_module_1.PaymentsModule,
            comments_module_1.CommentsModule,
            invoices_module_1.InvoicesModule,
            companies_module_1.CompaniesModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map