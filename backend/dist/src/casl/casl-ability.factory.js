"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaslAbilityFactory = void 0;
const common_1 = require("@nestjs/common");
const ability_1 = require("@casl/ability");
const prisma_1 = require("@casl/prisma");
let CaslAbilityFactory = class CaslAbilityFactory {
    createForUser(user) {
        const { can, cannot, build } = new ability_1.AbilityBuilder(prisma_1.createPrismaAbility);
        if (user.role === 'ADMIN') {
            can('manage', 'all');
        }
        if (user.role === 'RESEARCHER') {
            can('read', 'Program');
            can('create', 'Report');
            can('update', 'Report', { researcherId: user.id });
            can('read', 'Report', { researcherId: user.id });
            can('delete', 'Report', { researcherId: user.id, status: 'RESOLVED' });
            can('read', 'Payment', { researcherId: user.id });
            can('update', 'User', { id: user.id });
            can('read', 'User', { id: user.id });
            can('create', 'Comment');
            can('update', 'Comment', { userId: user.id });
            can('delete', 'Comment', { userId: user.id });
        }
        if (user.role === 'COMPANY') {
            can('create', 'Program');
            can('update', 'Program', { company: { users: { some: { id: user.id } } } });
            can('read', 'Program', { company: { users: { some: { id: user.id } } } });
            can('delete', 'Program', { company: { users: { some: { id: user.id } } } });
            can('read', 'Report', { program: { company: { users: { some: { id: user.id } } } } });
            can('update', 'Report', { program: { company: { users: { some: { id: user.id } } } } });
            can('create', 'Payment');
            can('read', 'Payment', { company: { users: { some: { id: user.id } } } });
            can('update', 'User', { id: user.id });
            can('read', 'User', { id: user.id });
            can('create', 'Comment');
            can('update', 'Comment', { userId: user.id });
            can('delete', 'Comment', { userId: user.id });
        }
        can('read', 'User', { isVerified: true });
        return build();
    }
};
exports.CaslAbilityFactory = CaslAbilityFactory;
exports.CaslAbilityFactory = CaslAbilityFactory = __decorate([
    (0, common_1.Injectable)()
], CaslAbilityFactory);
//# sourceMappingURL=casl-ability.factory.js.map