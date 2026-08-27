declare enum TicketPriority {
    BAJA = "BAJA",
    MEDIA = "MEDIA",
    URGENTE = "URGENTE"
}
export declare class CreateTicketDto {
    title: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    categoryId: string;
    subcategoryId?: string;
    workflowStateId: string;
    destinatarioId?: string;
    messageType?: string;
    tramiteSubtype?: string;
    responseUrgency?: string;
    fechaLimite?: string;
    priority?: TicketPriority;
    locationLabel?: string;
    parentTicketId?: string;
}
export {};
