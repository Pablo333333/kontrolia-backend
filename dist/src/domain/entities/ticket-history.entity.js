"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketHistory = void 0;
class TicketHistory {
    id;
    ticketId;
    oldStateId;
    newStateId;
    userId;
    timestamp;
    user;
    oldStateName;
    newStateName;
    userName;
    constructor(props) {
        Object.assign(this, props);
    }
}
exports.TicketHistory = TicketHistory;
//# sourceMappingURL=ticket-history.entity.js.map