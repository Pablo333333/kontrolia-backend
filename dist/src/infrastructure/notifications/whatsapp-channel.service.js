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
var WhatsAppChannelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppChannelService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WhatsAppChannelService = WhatsAppChannelService_1 = class WhatsAppChannelService {
    config;
    logger = new common_1.Logger(WhatsAppChannelService_1.name);
    accountSid;
    authToken;
    from;
    constructor(config) {
        this.config = config;
        this.accountSid = this.config.get('TWILIO_ACCOUNT_SID');
        this.authToken = this.config.get('TWILIO_AUTH_TOKEN');
        this.from = this.config.get('TWILIO_WHATSAPP_FROM');
        if (this.isEnabled()) {
            this.logger.log('WhatsApp (Twilio) channel enabled');
        }
        else {
            this.logger.warn('Twilio WhatsApp not configured — WhatsApp alerts disabled');
        }
    }
    isEnabled() {
        return Boolean(this.accountSid && this.authToken && this.from);
    }
    formatTo(phone) {
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.length < 8)
            return null;
        const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
        return `whatsapp:${withPlus}`;
    }
    async send(phone, body) {
        if (!this.isEnabled()) {
            this.logger.debug(`Skip WhatsApp to ${phone}: Twilio disabled`);
            return false;
        }
        const to = this.formatTo(phone);
        if (!to) {
            this.logger.warn(`Invalid WhatsApp phone: ${phone}`);
            return false;
        }
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
            const params = new URLSearchParams({
                From: this.from,
                To: to,
                Body: body,
            });
            const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            if (!response.ok) {
                const errText = await response.text();
                this.logger.error(`WhatsApp failed (${response.status}): ${errText}`);
                return false;
            }
            this.logger.log(`WhatsApp sent to ${to}`);
            return true;
        }
        catch (error) {
            this.logger.error(`WhatsApp error: ${error.message}`);
            return false;
        }
    }
};
exports.WhatsAppChannelService = WhatsAppChannelService;
exports.WhatsAppChannelService = WhatsAppChannelService = WhatsAppChannelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsAppChannelService);
//# sourceMappingURL=whatsapp-channel.service.js.map