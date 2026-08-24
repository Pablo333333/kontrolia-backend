import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * WhatsApp via Twilio WhatsApp API (optional).
 * Configure: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886)
 */
@Injectable()
export class WhatsAppChannelService {
  private readonly logger = new Logger(WhatsAppChannelService.name);
  private readonly accountSid: string | undefined;
  private readonly authToken: string | undefined;
  private readonly from: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    this.from = this.config.get<string>('TWILIO_WHATSAPP_FROM');

    if (this.isEnabled()) {
      this.logger.log('WhatsApp (Twilio) channel enabled');
    } else {
      this.logger.warn('Twilio WhatsApp not configured — WhatsApp alerts disabled');
    }
  }

  isEnabled(): boolean {
    return Boolean(this.accountSid && this.authToken && this.from);
  }

  /** Normalizes to E.164-ish digits; prefixes whatsapp: */
  private formatTo(phone: string): string | null {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.length < 8) return null;
    const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    return `whatsapp:${withPlus}`;
  }

  async send(phone: string, body: string): Promise<boolean> {
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
        From: this.from!,
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
    } catch (error: any) {
      this.logger.error(`WhatsApp error: ${error.message}`);
      return false;
    }
  }
}
