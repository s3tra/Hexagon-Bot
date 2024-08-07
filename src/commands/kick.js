import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Kick extends BaseCommand {
  constructor() {
    super({
      commandName: 'kick',
      displayName: 'Kick',
      commandDescription: 'Kick someone from the server.',
      commandCategory: 'Moderation',
      commandPermissions: ['KickMembers', 'Administrator'],
      commandOptions: [{ name: 'member', description: 'Who would you like to kick?', type: 6, required: true }],
    });
  }

  async execute(interaction) {
    const options = interaction.options;
    const member = interaction.guild.members.cache.get(options.getUser('member').id);
    const embed = new EmbedBuilder()
      .setTitle('Member Kicked')
      .setDescription('The specified member has been successfully kicked.')
      .addFields([
        { name: 'Moderator', value: `<@${interaction.member.user.id}>` },
        { name: 'Member', value: `<@${member.user.id}>` },
      ])
      .setColor('#0099ff')
      .setTimestamp();
    const embed2 = new EmbedBuilder()
      .setDescription('<:Error:1078317593867325500> I am unable to kick this user. Is my role higher than theirs?')
      .setColor('#cc2900');
    if (member.kickable) {
      try {
        member.kick();
      } catch (error) {
        return interaction.reply({
          embeds: [embed2],
        });
      }
      return interaction.reply({
        embeds: [embed],
      });
    } else {
      return interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
  }
}
