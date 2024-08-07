import { BaseEvent } from '../BaseEvent.js';
import ticketStore from '../database/TicketStore.js';

export default class ChannelDelete extends BaseEvent {
  constructor() {
    super({ eventName: 'channelDelete' });
  }
  async execute(client, [channel]) {
    const channelName = channel.name.toLowerCase();
    if (channelName.match('ticket')) {
      const ticketData = await ticketStore.deleteTicket(channel.id);
    }
  }

  Start(Client) {
    Client.on('channelDelete', (channel) => {
      this.ChannelDelete(channel);
    });
  }
}
