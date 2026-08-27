import { ConfigService } from '@nestjs/config';
export declare class EmailChannelService {
    private readonly config;
    private readonly logger;
    private transporter;
    private readonly from;
    constructor(config: ConfigService);
    isEnabled(): boolean;
    send(to: string, subject: string, text: string, html?: string): Promise<boolean>;
}
