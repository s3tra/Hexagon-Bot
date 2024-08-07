import { BaseEvent } from '../BaseEvent.js';
import guildStore from '../database/GuildStore.js';

export default class GuildDelete extends BaseEvent {
  constructor() {
    super({ eventName: 'guildDelete' });
  }
  async execute(client, [guild]) {
    await guildStore.deleteGuild(guild.id);
  }

  Start(Client) {
    Client.on('guildDelete', async (Guild) => {
      this.GuildDelete(Guild);
    });
  }
}
