import { ConfigService } from '@nestjs/config';
export declare class WhatsAppChannelService {
    private readonly config;
    private readonly logger;
    private readonly accountSid;
    private readonly authToken;
    private readonly from;
    constructor(config: ConfigService);
    isEnabled(): boolean;
    private formatTo;
    send(phone: string, body: string): Promise<boolean>;
}
