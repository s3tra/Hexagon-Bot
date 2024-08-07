import { BaseEvent } from '../BaseEvent.js';
import guildStore from '../database/GuildStore.js';

export default class MessageDelete extends BaseEvent {
  constructor() {
    super({ eventName: 'messageDelete' });
  }

  async execute(client, [message]) {
    const guildData = await guildStore.getGuild(message.guild.id);

    let author;
    let id;
    if (!message.author) {
      author = {
        name: 'Unknown',
        iconURL: 'https://cdn.discordapp.com/attachments/1109896599380955146/1134144995989913600/HCyMix.png',
      };
      id = 'Unknown';
    } else {
      author = { name: `${message.author.username}`, iconURL: message.author.avatarURL() };
      id = message.author.id;
    }
    if (guildData) {
      if (guildData.logging.logChannel === '') return;
      if (message.channel.id.toString() === guildData.logging.logChannel) return;
    }
    this.modLog(client, message.guild.id, 'guildMessages', {
      type: 'negative',
      description: `Message sent by ${author.name} was deleted in <#${message.channel.id}>.\n\`${
        message.content ? message.content : 'Unknown'
      }\``,
      footer: { text: id.toString() },
      author: author,
    });
    return;
  }
}
