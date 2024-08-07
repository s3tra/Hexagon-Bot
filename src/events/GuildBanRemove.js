import { BaseEvent } from '../BaseEvent.js';

export default class GuildBanRemove extends BaseEvent {
  constructor() {
    super({ eventName: 'guildBanRemove' });
  }

  async execute(client, [guildBan]) {}
}
