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
exports.CreatePayoutDto = exports.PayoutDestinationDto = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["UZCARD"] = "UZCARD";
    PaymentMethod["HUMO"] = "HUMO";
    PaymentMethod["PAYPAL"] = "PAYPAL";
    PaymentMethod["CRYPTOCURRENCY"] = "CRYPTOCURRENCY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class PayoutDestinationDto {
    cardNumber;
    walletAddress;
    accountHolderName;
}
exports.PayoutDestinationDto = PayoutDestinationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayoutDestinationDto.prototype, "cardNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayoutDestinationDto.prototype, "walletAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayoutDestinationDto.prototype, "accountHolderName", void 0);
class CreatePayoutDto {
    amount;
    currency = 'USD';
    method;
    destination;
}
exports.CreatePayoutDto = CreatePayoutDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreatePayoutDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayoutDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], CreatePayoutDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PayoutDestinationDto),
    __metadata("design:type", PayoutDestinationDto)
], CreatePayoutDto.prototype, "destination", void 0);
//# sourceMappingURL=create-payout.dto.js.map