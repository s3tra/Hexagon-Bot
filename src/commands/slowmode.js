import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import userStore from '../database/UserStore.js';

export default class Support extends BaseCommand {
  constructor() {
    super({
      commandName: 'slowmode',
      displayName: 'Slowmode',
      commandDescription: 'Set channel slowmode.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      isPremium: true,
      commandOptions: [
        {
          name: 'duration',
          description: 'How long would you like the slowmode to be?',
          type: 3,
          choices: [
            { name: '1 Second', value: '1000' },
            { name: '3 Seconds', value: '3000' },
            { name: '5 Seconds', value: '5000' },
            { name: '1 Minute', value: '60000' },
            { name: '5 Minutes', value: '300000' },
            { name: '10 Minutes', value: '600000' },
            { name: '15 Minutes', value: '900000' },
            { name: '1 Hour', value: '3600000' },
          ],
          required: true,
        },
        { name: 'channel', description: 'Where would you like the slowmode to be?', type: 7, required: false },
      ],
    });
  }

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const userData = await userStore.getUser(interaction.member.id);
    if (!userData) return interaction.reply({ content: 'An error occured whilst getting the user data.', ephemeral: true });

    const serverOwnerData = await userStore.getUser(interaction.guild.ownerId);
    if (!serverOwnerData) return interaction.reply({ content: 'An error occured whilst getting the user data.', ephemeral: true });

    const embed2 = new EmbedBuilder().setColor('#cc2900');
    const embed = new EmbedBuilder().setColor('#34eb80');

    if (channel.type !== 0) {
        embed2.setDescription('<:Error:1078317593867325500> Select or run this command in a text channel.');
        
        console.log(channel.type);

        return interaction.reply({
          embeds: [embed2],
          ephemeral: true,
        });
    }

    if (userData.isPremium === false && serverOwnerData.isPremium === false) {
        embed2.setDescription('<:Error:1078317593867325500> This command is a premium feature.');

        return interaction.reply({
            embeds: [embed2],
            ephemeral: true,
        });
    }

    const durationHoistedOption = interaction.options._hoistedOptions[0];
    const duration = durationHoistedOption.value;

    const durationTimes = {
        '1000': '1 Second',
        '3000': '3 Seconds',
        '5000': '5 Seconds',
        '60000': '1 Minute',
        '300000': '5 Minutes',
        '600000': '10 Minutes',
        '900000': '15 Minutes',
        '3600000': '1 Hour',
    };

    const durationName = durationTimes[duration.toString()];

    try {
        channel.setRateLimitPerUser(duration / 1000);
    } catch(error) {
        embed2.setDescription('<:Error:1078317593867325500> An error occured whilst setting the channel slowmode.');

        return interaction.reply({
          embeds: [embed2],
          ephemeral: true,
        });
    }

    embed.setDescription('<:Success:1078317580420382720> Slowmode as been set to `' + durationName + '` for <#' + channel.id + '>.');
    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}