import { Ticket } from '../entities/ticket.entity';
export type TicketListFilters = {
    categoryId?: string;
    subcategoryId?: string;
    workflowStateId?: string;
    priority?: string;
    messageType?: string;
    userId?: string;
    destinatarioId?: string;
    q?: string;
    includeArchived?: boolean;
    includeDocuments?: boolean;
    includeLastResponse?: boolean;
    limit?: number;
    offset?: number;
};
export interface ITicketRepository {
    create(ticket: Ticket): Promise<Ticket>;
    findById(id: string): Promise<Ticket | null>;
    findAll(filters?: TicketListFilters): Promise<Ticket[]>;
    getStats(): Promise<any>;
    update(id: string, ticket: Partial<Ticket>): Promise<Ticket>;
    delete(id: string): Promise<void>;
}
export declare const ITicketRepository: unique symbol;
