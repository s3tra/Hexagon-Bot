import ticketStore from '../database/TicketStore.js';

export const oldTickets = {
  async deleteTicketData(channelId) {
    await ticketStore.deleteTicket(channelId);
  },

  async start(client) {
    const tickets = await ticketStore.model.find();
    for (const ticket of tickets) {
      try {
        const channel = await client.channels.fetch(ticket.ChannelId);
      } catch (err) {
        this.deleteTicketData(ticket.ChannelId);
      }
    }
    return;
  },
};
