import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class BanCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'unban',
      displayName: 'Unban',
      commandDescription: 'Unban someone from the server.',
      commandCategory: 'Moderation',
      commandPermissions: ['BanMembers', 'Administrator'],
      commandOptions: [{ name: 'member', description: 'What User Id would you like to unban?', type: 3, required: true }],
    });
  }

  async execute(interaction) {
    const options = interaction.options;
    const memberGiven = options.getString('member');
    const bans = await interaction.guild.bans.fetch();
    const embed2 = new EmbedBuilder()
      .setDescription('<:Error:1078317593867325500> This member is not currently banned.')
      .setColor('#cc2900');

    const ban = await bans.get(memberGiven);
    if (!ban) {
      return interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
    const embed = new EmbedBuilder()
      .setTitle('Member Unbanned')
      .setDescription('The specified member has been successfully unbanned.')
      .addFields([
        { name: 'Moderator', value: `<@${interaction.member.user.id}>` },
        { name: 'Member', value: `<@${memberGiven}>` },
      ])
      .setColor('#0099ff')
      .setTimestamp();

    try {
      interaction.guild.members.unban(memberGiven);
    } catch (error) {
      return interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
    return interaction.reply({
      embeds: [embed],
    });
  }
}
