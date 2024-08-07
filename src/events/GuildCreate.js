import { AuditLogEvent } from 'discord.js';
import guildStore from '../database/GuildStore.js';
import { BaseEvent } from '../BaseEvent.js';

export default class GuildCreate extends BaseEvent {
  constructor() {
    super({ eventName: 'guildCreate' });
  }
  async execute(client, [guild]) {
    console.log('execute');
    let logs;
    try {
      logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.BotAdd,
      });
    } catch (err) {}
    const log = logs.entries.first();
    await guildStore.getGuild(guild.id);

    // const guildOwner = log.executor;
    // if (guildOwner) {
    //   try {
    //     guildOwner.send({
    //       content:
    //         "Thanks for inviting Hexagon to your server! 🎉\n\nYou've just unlocked a ton of new commands! Some of these include, tickets, moderation and community management.\n\nRun `/commands` to get started.\nSupport Server: discord.gg/UWA8ujD7Th",
    //     });
    //   } catch (error) {
    //     return;
    //   }
    // } else {
    //   return;
    // };
  }

  Start(Client) {
    Client.on('guildCreate', async (Guild) => {
      this.GuildCreate(Guild);
    });
  }
}
