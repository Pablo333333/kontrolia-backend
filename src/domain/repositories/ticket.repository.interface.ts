import { Ticket } from '../entities/ticket.entity';

export interface ITicketRepository {
  create(ticket: Ticket): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  findAll(filters?: {
    categoryId?: string;
    workflowStateId?: string;
    q?: string;
    includeArchived?: boolean;
    includeDocuments?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Ticket[]>;
  getStats(): Promise<any>;
  update(id: string, ticket: Partial<Ticket>): Promise<Ticket>;
  delete(id: string): Promise<void>;
}

export const ITicketRepository = Symbol('ITicketRepository');
