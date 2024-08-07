import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Support extends BaseCommand {
  constructor() {
    super({
      commandName: 'timeout',
      displayName: 'Timeout',
      commandDescription: 'Timeout a user.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: [
        { name: 'member', description: 'Who would you like to timeout?', type: 6, required: true },
        {
          name: 'duration',
          description: 'How long would you like the timeout to be?',
          type: 3,
          choices: [
            { name: '1 Minute', value: '60000' },
            { name: '5 Minutes', value: '300000' },
            { name: '10 Minutes', value: '600000' },
            { name: '15 Minutes', value: '900000' },
            { name: '1 Week', value: '604800000' },
          ],
          required: true,
        },
      ],
    });
  }

  async execute(interaction) {
    const user = interaction.options.getUser('member');
    const member = await interaction.guild.members.fetch(user.id);
    if (!member) return interaction.reply({ content: 'The mentioned user is not in the server.', ephemeral: true });
    const duration = interaction.options._hoistedOptions[1].value;
    const embed2 = new EmbedBuilder().setColor('#cc2900');

    try {
      await member.timeout(parseInt(duration));
    } catch (error) {
      embed2.setDescription('<:Error:1078317593867325500> I am unable to timeout this user. Is my role higher than theirs?');
      return interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
    return interaction.reply({
      content: `<@${user.id}> has been given a timeout.`,
      ephemeral: true,
    });
  }
}
