import { AuditLogEvent, EmbedBuilder } from 'discord.js';
import { BaseEvent } from '../BaseEvent.js';
import guildStore from '../database/GuildStore.js';

export default class GuildAuditLogEntryCreate extends BaseEvent {
  constructor() {
    super({ eventName: 'guildAuditLogEntryCreate' });
  }

  async execute(client, [auditLogEntry, guild]) {
    let action, data;

    const member = await guild.members.fetch(auditLogEntry.executorId);

    switch (auditLogEntry.action) {
      case AuditLogEvent.ChannelCreate:
        action = 'guildChannels';
        data = {
          type: 'positive',
          description: `**<@${auditLogEntry.executorId}> created channel <#${auditLogEntry.target.id}>.**`,
          author: { name: member.user.username, iconURL: member.user.displayAvatarURL() },
          footer: { text: member.user.id },
        };
        break;
      case AuditLogEvent.MemberRoleUpdate:
        const target = await guild.members.fetch(auditLogEntry.target.id);
        let roleString = '';
        let type;
        let desc;
        auditLogEntry.changes[0].new.forEach((role) => {
          if (roleString === '') {
            roleString = `${role.name}`;
          } else {
            roleString = roleString + `, ${role.name}`;
          }
        });
        if (auditLogEntry.actionType == 'Update') {
          if (auditLogEntry.changes[0].key == '$add') {
            type = 'positive';
            desc = `**<@${auditLogEntry.target.id}>` + ' was given the `' + `${roleString}` + '` role.**';
          } else {
            type = 'negative';
            desc = `**<@${auditLogEntry.target.id}>` + ' was removed from the `' + `${roleString}` + '` role.**';
          }
        }

        action = 'userRoles';
        data = {
          type: type,
          description: desc,
          author: { name: target.user.username, iconURL: target.user.displayAvatarURL() },
          footer: { text: target.user.id },
        };
        break;
      case AuditLogEvent.ChannelDelete:
        const nameChange = auditLogEntry.changes.find(change => change.key === 'name');

        action = 'guildChannels';
        data = {
          type: 'negative',
          description: `**<@${auditLogEntry.executorId}> deleted channel #${nameChange ? nameChange.old : "Unknown"}.**`,
          author: { name: member.user.username, iconURL: member.user.displayAvatarURL() },
          footer: { text: member.user.id },
        };
        break;
      case AuditLogEvent.RoleCreate:
        // Handled by event.

        break;

      case AuditLogEvent.RoleDelete:
        // Handled by event.

        break;
      case AuditLogEvent.MemberBanAdd:
        action = 'guildBans';
        data = {
          type: 'positive',
          description: `<@${auditLogEntry.target.id}> was banned by <@${auditLogEntry.executorId}>.`,
          author: { name: 'Member Banned' },
          footer: { text: member.user.id },
        };
        break;
      case AuditLogEvent.MemberBanRemove:
        action = 'guildBans';
        data = {
          type: 'positive',
          description: `<@${auditLogEntry.target.id}> was unbanned by <@${auditLogEntry.executorId}>.`,
          author: { name: 'Member Unbanned' },
          footer: { text: member.user.id },
        };
        break;
      case AuditLogEvent.MemberKick:
        action = 'guildKicks';
        data = {
          type: 'negative',
          description: `<@${auditLogEntry.target.id}> was kicked by <@${auditLogEntry.executorId}>.`,
          author: { name: 'Member Kicked' },
          footer: { text: member.user.id },
        };
    }
    const guildData = await guildStore.getGuild(guild.id);

    if (!guildData) return;

    if (!guildData.logging.enabled || !guildData.logging.logChannel) return;

    if (!guildData.logging.actions[action]) return;

    const embed = new EmbedBuilder().setColor(data.type === 'positive' ? '#34eb80' : '#cc2900').setTimestamp();

    if (data.description) embed.setDescription(data.description);
    if (data.fields) embed.setFields(data.fields);
    if (data.title) embed.setTitle(data.title);
    if (data.author) embed.setAuthor(data.author);
    if (data.footer) embed.setFooter(data.footer);

    (await client.channels.fetch(guildData.logging.logChannel)).send({
      embeds: [embed],
    });
  }
}