import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import guildStore from '../database/GuildStore.js';

export default class DelModCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'delmod',
      displayName: 'Del Mod',
      commandDescription: 'Remove a guild moderator user or role.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: [
        {
          name: 'user',
          description: 'Assign a user as a moderator.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'user',
              description: 'The user to make a moderator',
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: 'role',
          description: 'Assign a role as a moderator.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'role',
              description: 'The role to make a moderator',
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
      ],
    });
  }

  async execute(interaction) {
    const guildData = await guildStore.getGuild(interaction.guild.id);

    const embed = new EmbedBuilder().setColor('#cc2900');

    if (interaction.options.getSubcommand() === 'user') {
      const user = interaction.options.get('user').user;
      if (!user) return console.log('ERROR - Somehow there was no user provided!');
      const current = guildData.moderation.modUsers.find((id) => id === user.id);
      if (!current) {
        embed.setDescription(`<:Error:1078317593867325500> <@${user.id}> is not a moderator.`);
      } else {
        const index = guildData.moderation.modUsers.indexOf(user.id);

        guildData.moderation.modUsers.splice(index, 1);

        embed.setTitle('Mod User Removed').setDescription(`<@${user.id}> was removed as a moderator.`);
      }
    } else if (interaction.options.getSubcommand() === 'role') {
      const role = interaction.options.get('role').role;
      if (!role) return console.log('ERROR - Somehow there was no role provided!');

      const current = guildData.moderation.modRoles.find((id) => id === role.id);
      if (!current) {
        embed.setDescription(`<:Error:1078317593867325500> <@&${role.id}> is not a moderator role.`);
      } else {
        const index = guildData.moderation.modRoles.indexOf(role.id);
        guildData.moderation.modRoles.splice(index, 1);

        embed.setTitle('Mod Role Removed').setDescription(`<@&${role.id}> was removed as a moderator role.`);
      }
    }
    guildData.save();

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
