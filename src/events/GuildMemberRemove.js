import { BaseEvent } from '../BaseEvent.js';
import guildStore from '../database/GuildStore.js';

export default class GuildMemberRemove extends BaseEvent {
  constructor() {
    super({ eventName: 'guildMemberRemove' });
  }

  async execute(client, [member]) {
    const guildData = await guildStore.getGuild(member.guild.id);

    if (guildData) {
      if (guildData.memberLogging.logChannel === '') return;
    } else return;

    this.joinLog(client, member.guild.id, 'memberLeaves', {
      type: 'negative',
      description: `<@${member.user.id}> **left the server.**`,
      footer: { text: member.user.id.toString() },
      author: { name: member.user.username, iconURL: member.user.avatarURL() },
    });
    return;
  }
}
