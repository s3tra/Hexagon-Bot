import { BaseEvent } from '../BaseEvent.js';

export default class GuildBanAdd extends BaseEvent {
  constructor() {
    super({ eventName: 'guildBanAdd' });
  }

  async execute(client, guildBan) {}
}
