"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
class Ticket {
    constructor(partial) {
        Object.assign(this, partial);
    }
    id;
    title;
    description;
    latitude;
    longitude;
    locationLabel;
    workflowStateId;
    categoryId;
    subcategoryId;
    userId;
    priority;
    isArchived;
    destinatarioId;
    messageType;
    tramiteSubtype;
    responseUrgency;
    fechaLimite;
    parentTicketId;
    rootTicketId;
    isContinuation;
    workGroupId;
    createdAt;
    updatedAt;
    documents;
    history;
    comments;
    statusName;
    categoryName;
    subcategoryName;
    destinatarioName;
    remitenteName;
    lastResponseContent;
    lastResponseAt;
}
exports.Ticket = Ticket;
//# sourceMappingURL=ticket.entity.js.map