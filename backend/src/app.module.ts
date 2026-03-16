import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
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
import { MetricsModule } from './common/metrics/metrics.module';
import { SecurityModule } from './common/security/security.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Structured logging with Pino
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    // Redis cache for auth token/lockout services
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: 'memory', // Switch to 'redis' store in production with ioredis
        ttl: 300000, // 5 min default
      }),
      inject: [ConfigService],
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
    MetricsModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
