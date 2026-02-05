import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { StorageModule } from './storage/storage.module';
import { QueueModule } from './queue/queue.module';
import { SearchModule } from './search/search.module';
import { CaslModule } from './casl/casl.module';
import { GraphQLModule } from './graphql/graphql.module';
import { InvitationModule } from './invitation/invitation.module';
import { AchievementsModule } from './achievements/achievements.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SMSModule } from './sms/sms.module';
import { AIModule } from './ai/ai.module';
import { TaxModule } from './tax/tax.module';
import { PDFModule } from './pdf/pdf.module';
import { AuthModule } from './auth/auth.module';
import { ProgramsModule } from './programs/programs.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { CommentsModule } from './comments/comments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CompaniesModule } from './companies/companies.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    RedisModule,
    EmailModule,
    StorageModule,
    QueueModule,
    SearchModule,
    CaslModule,
    GraphQLModule,
    InvitationModule,
    AchievementsModule,
    LeaderboardModule,
    WebhooksModule,
    SMSModule,
    AIModule,
    TaxModule,
    PDFModule,
    PrismaModule,
    AuthModule,
    ProgramsModule,
    ReportsModule,
    NotificationsModule,
    UsersModule,
    PaymentsModule,
    CommentsModule,
    InvoicesModule,
    CompaniesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
