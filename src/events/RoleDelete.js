import { AuditLogEvent } from 'discord.js';
import { BaseEvent } from '../BaseEvent.js';

export default class RoleDelete extends BaseEvent {
  constructor() {
    super({ eventName: 'roleDelete' });
  }

  async execute(client, [role]) {
    const guild = await client.guilds.fetch(role.guild.id);

    if (guild) {
      let log;
      try {
        log = (await guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 })).entries.first();
      } catch (error) {
        return;
      }

      let author;
      let id;
      if (!log) {
        return;
      }
      if (!log.executorId) {
        author = {
          name: 'Unknown',
          iconURL: 'https://cdn.discordapp.com/attachments/1109896599380955146/1134144995989913600/HCyMix.png',
        };
        id = 'Unknown';
      } else {
        const member = await guild.members.fetch(log.executorId);
        author = { name: `${member.user.username}`, iconURL: member.user.avatarURL() };
        id = member.user.id;
      }

      this.modLog(client, role.guild.id, 'guildRoles', {
        type: 'negative',
        description: `${log.executorId ? `<@${log.executorId}>` : `\`Unknown\``} deleted role \`${role.name}\`.`,
        footer: { text: id.toString() },
        author: author,
      });
      return;
    } else {
      return;
    }
  }
}
