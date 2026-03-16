"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subject = exports.AbilityFactory = void 0;
const ability_1 = require("@casl/ability");
Object.defineProperty(exports, "subject", { enumerable: true, get: function () { return ability_1.subject; } });
const common_1 = require("@nestjs/common");
let AbilityFactory = class AbilityFactory {
    createForUser(user) {
        const { can, cannot, build } = new ability_1.AbilityBuilder(ability_1.createMongoAbility);
        switch (user.role) {
            case 'SUPER_ADMIN':
                can('manage', 'all');
                cannot('create', 'Program');
                cannot('create', 'Report');
                cannot('delete', 'AuditLog');
                cannot('update', 'AuditLog');
                cannot('delete', 'LedgerEntry');
                cannot('update', 'LedgerEntry');
                break;
            case 'COMPANY':
                can('create', 'Program');
                can('read', 'Program', { companyId: user.companyId });
                can('update', 'Program', { companyId: user.companyId });
                can('delete', 'Program', { companyId: user.companyId });
                can('read', 'Report');
                can('update', 'Report');
                can('read', 'Payout');
                can('update', 'Payout');
                can('create', 'ProgramInvite');
                can('read', 'ProgramInvite');
                can('update', 'ProgramInvite');
                cannot('read', 'SecurityAlert');
                cannot('read', 'AuditLog');
                cannot('read', 'LedgerEntry');
                cannot('read', 'Settings');
                cannot('read', 'SystemHealth');
                cannot('manage', 'User');
                break;
            case 'RESEARCHER':
                can('create', 'Report');
                can('read', 'Report', { researcherId: user.id });
                can('update', 'Report', { researcherId: user.id });
                can('read', 'Program');
                can('read', 'Payout', { researcherId: user.id });
                can('read', 'User', { id: user.id });
                can('update', 'User', { id: user.id });
                cannot('read', 'SecurityAlert');
                cannot('read', 'AuditLog');
                cannot('read', 'LedgerEntry');
                cannot('read', 'Settings');
                cannot('read', 'SystemHealth');
                cannot('create', 'Program');
                cannot('create', 'ProgramInvite');
                break;
        }
        return build();
    }
};
exports.AbilityFactory = AbilityFactory;
exports.AbilityFactory = AbilityFactory = __decorate([
    (0, common_1.Injectable)()
], AbilityFactory);
//# sourceMappingURL=ability.factory.js.map