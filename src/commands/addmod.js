import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import guildStore from '../database/GuildStore.js';

export default class AddModCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'addmod',
      displayName: 'Add Mod',
      commandDescription: 'Add a guild moderator user or role.',
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

    const embed = new EmbedBuilder();

    if (interaction.options.getSubcommand() === 'user') {
      const user = interaction.options.get('user').user;
      if (!user) return console.log('ERROR - Somehow there was no user provided!');
      const current = guildData.moderation.modUsers.find((id) => id === user.id);
      if (!current) {
        guildData.moderation.modUsers.push(user.id);

        embed.setColor('#34eb80').setTitle('Mod User Added').setDescription(`<@${user.id}> was added as a moderator.`);
      } else {
        embed.setColor('#cc2900').setDescription(`<:Error:1078317593867325500> <@${user.id}> is already a moderator.`);
      }
    } else if (interaction.options.getSubcommand() === 'role') {
      const role = interaction.options.get('role').role;
      if (!role) return console.log('ERROR - Somehow there was no role provided!');

      const current = guildData.moderation.modRoles.find((id) => id === role.id);
      if (!current) {
        guildData.moderation.modRoles.push(role.id);

        embed.setColor('#34eb80').setTitle('Mod Role Added').setDescription(`<@&${role.id}> was added as a moderator role.`);
      } else {
        embed.setColor('#cc2900').setDescription(`<:Error:1078317593867325500> <@&${role.id}> is already a moderator role.`);
      }
    }
    guildData.save();

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
