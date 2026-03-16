// ============================================
// Security Module — FraudEngine + AlertService + Alert Queue
// ============================================
import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AlertService } from './alert.service';
import { FraudEngine } from './fraud-engine.service';
import { RiskScoreService } from './risk-score.service';

@Global()
@Module({
    imports: [
        BullModule.registerQueue({ name: 'alerts' }),
    ],
    providers: [AlertService, FraudEngine, RiskScoreService],
    exports: [AlertService, FraudEngine, RiskScoreService],
})
export class SecurityModule { }
