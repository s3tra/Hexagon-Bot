import { Schema } from 'mongoose';
import { BaseStore } from '../BaseStore.js';

const ticketSchema = new Schema({
  openedBy: { type: String },
  claimedBy: { type: String },
  channelId: { type: String },
});

class TicketStore extends BaseStore {
  constructor() {
    super(ticketSchema, 'HexagonTicket');
  }

  async getTicketByChannel(id, options) {
    const ticket = await this.model.findOne({ channelId: id });
    let create = options?.create;
    if (create === undefined) create = true;
    if (!ticket && create) return await this.createTicket({ channelId: id });
    else return ticket;
  }

  async createTicket(data) {
    let ticket;
    try {
      ticket = await this.model.create(data);
    } catch (err) {
      ticket = await this.getTicketByChannel(data.channelId);
    }
    return ticket;
  }

  async deleteTicket(id) {
    return await this.model.deleteOne({ channelId: id });
  }
}

export default new TicketStore();
