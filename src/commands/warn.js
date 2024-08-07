import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import guildStore from '../database/GuildStore.js';

async function getDatabaseMember(user, guildId) {
  const guildData = await guildStore.getGuild(guildId);

  if (!guildData.members) guildData.members = [];

  let guildMemberData = guildData.members.find((member) => member.id === user.id);

  if (!guildMemberData)
    guildData.members.push({
      id: user.id,
      warnings: [],
    });
  guildMemberData = guildData.members.find((member) => member.id === user.id);

  return { databaseGuild: guildData, databaseMember: guildMemberData };
}

export default class WarnCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'warn',
      displayName: 'Warn',
      commandDescription: 'Warn a user.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: [
        {
          name: 'add',
          description: 'Warn a user.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'user',
              description: 'The user to warn',
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: 'reason',
              description: 'The reason for the warning',
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: 'remove',
          description: 'Remove a warning.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'user',
              description: 'The user to warn',
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: 'id',
              description: 'The ID of the warning',
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
      ],
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder();

    if (interaction.options.getSubcommand() === 'add') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      const id = Date.now().toString();

      if (!user || !reason) {
        throw new Error('Invalid user or reason provided.');
      }

      if (user === interaction.user) {
        const embed3 = new EmbedBuilder()
        .setDescription("<:Error:1078317593867325500> You can't warn yourself.")
        .setColor("#cc2900");

        return interaction.reply({
          embeds: [embed3],
          ephemeral: true
        });
      }

      embed
        .setDescription(`<:Success:1078317580420382720> \`${user.username}\` has been warned for \`${reason}\`.`)
        .setColor('#34eb80');

      const { databaseGuild, databaseMember } = await getDatabaseMember(user, interaction.guildId);

      databaseMember.warnings.push({ id, reason: reason });

      databaseGuild.members[databaseGuild.members.findIndex((member) => member.id === user.id)] = databaseMember;

      databaseGuild.save();

      // Send a dm to the warned user

      const dmEmbed = new EmbedBuilder()
        .setTitle("Warning")
        .setDescription(`You were warned in ${interaction.guild.name} for ${reason}.`)
        .setColor("#0099ff")
        .setTimestamp();
      
      try {
        user.send({
          embeds: [dmEmbed],
        });
      } catch(error) {
        return console.error("User does not have their direct messages enabled");
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (interaction.options.getSubcommand() === 'remove') {
      const user = interaction.options.getUser('user');
      const warningId = interaction.options.getString('id');

      if (!warningId) {
        throw new Error('Invalid warning ID provided.');
      }

      embed.setDescription(`<:Success:1078317580420382720> Warning \`${warningId}\` has been removed.`).setColor('#34eb80');

      const { databaseGuild, databaseMember } = await getDatabaseMember(user, interaction.guildId);

      const index = databaseMember.warnings.findIndex((warning) => warning.id === warningId);

      if (!databaseMember.warnings[index]) {
        const embed2 = new EmbedBuilder()
          .setDescription('<:Error:1078317593867325500> The provided warning is invalid.')
          .setColor('#cc2900');

        return interaction.reply({
          embeds: [embed2],
          ephemeral: true
        });
      } else databaseMember.warnings.splice(index, 1);

      databaseGuild.members[databaseGuild.members.findIndex((member) => member.id === user.id)] = databaseMember;

      databaseGuild.save();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}