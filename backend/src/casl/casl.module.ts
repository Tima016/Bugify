import { Module, Global } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { PoliciesGuard } from './policies.guard';

@Global()
@Module({
    providers: [AbilityFactory, PoliciesGuard],
    exports: [AbilityFactory, PoliciesGuard],
})
export class CaslModule { }
