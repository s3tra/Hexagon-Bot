import { EmbedBuilder } from 'discord.js';
import guildStore from './database/GuildStore.js';

export class BaseEvent {
  constructor(options) {
    this.eventName = options.eventName;
  }

  async modLog(client, guildId, action, data) {
    const guildData = await guildStore.getGuild(guildId);

    if (!guildData) return;
    if (!guildData.logging.enabled || !guildData.logging.logChannel) return;

    if (!guildData.logging.actions[action]) return;

    const embed = new EmbedBuilder().setColor(data.type === 'positive' ? '#34eb80' : '#cc2900').setTimestamp();

    if (data.fields) embed.setFields(data.fields);

    if (data.description) embed.setDescription(data.description);

    if (data.footer) embed.setFooter(data.footer);

    if (data.author) embed.setAuthor(data.author);

    if (data.title) embed.setTitle(data.title);

    const logChannel = await client.channels.fetch(guildData.logging.logChannel);
    if (logChannel) {
      logChannel.send({
        embeds: [embed],
      });
    } else {
      return;
    }
  }

  async joinLog(client, guildId, action, data) {
    const guildData = await guildStore.getGuild(guildId);
    if (!guildData) return;
    if (!guildData.memberLogging.enabled || !guildData.memberLogging.logChannel) return;

    if (!guildData.memberLogging.actions[action]) return;

    const embed = new EmbedBuilder().setColor(data.type === 'positive' ? '#34eb80' : '#cc2900').setTimestamp();

    if (data.fields) embed.setFields(data.fields);

    if (data.description) embed.setDescription(data.description);

    if (data.footer) embed.setFooter(data.footer);

    if (data.author) embed.setAuthor(data.author);

    if (data.title) embed.setTitle(data.title);

    const logChannel = await client.channels.fetch(guildData.memberLogging.logChannel);
    if (logChannel) {
      logChannel.send({
        embeds: [embed],
      });
    } else {
      return;
    }
  }
}
