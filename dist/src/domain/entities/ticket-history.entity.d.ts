export declare class TicketHistory {
    id: string;
    ticketId: string;
    oldStateId: string | null;
    newStateId: string;
    userId: string;
    timestamp: Date;
    user?: {
        name: string | null;
        email: string;
    };
    oldStateName?: string;
    newStateName?: string;
    userName?: string;
    constructor(props: Partial<TicketHistory>);
}
