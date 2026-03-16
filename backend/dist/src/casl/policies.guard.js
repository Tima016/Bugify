"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciesGuard = exports.CheckPolicies = exports.CHECK_POLICIES_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ability_factory_1 = require("./ability.factory");
exports.CHECK_POLICIES_KEY = 'check_policies';
const CheckPolicies = (...handlers) => (0, common_1.SetMetadata)(exports.CHECK_POLICIES_KEY, handlers);
exports.CheckPolicies = CheckPolicies;
let PoliciesGuard = class PoliciesGuard {
    reflector;
    abilityFactory;
    constructor(reflector, abilityFactory) {
        this.reflector = reflector;
        this.abilityFactory = abilityFactory;
    }
    canActivate(context) {
        const handlers = this.reflector.get(exports.CHECK_POLICIES_KEY, context.getHandler()) || [];
        if (handlers.length === 0)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            return false;
        const ability = this.abilityFactory.createForUser(user);
        return handlers.every(handler => handler(ability));
    }
};
exports.PoliciesGuard = PoliciesGuard;
exports.PoliciesGuard = PoliciesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        ability_factory_1.AbilityFactory])
], PoliciesGuard);
//# sourceMappingURL=policies.guard.js.map