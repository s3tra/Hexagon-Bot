import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelSelectMenuBuilder,
} from 'discord.js';
import guildStore from '../database/GuildStore.js';
import { BaseCommand } from '../BaseCommand.js';

export default class ModLogs extends BaseCommand {
  constructor() {
    super({
      commandName: 'joinlogs',
      displayName: 'Joinlogs',
      commandDescription: 'Set join logging settings.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: [],
    });
  }

  async execute(interaction) {
    const guildData = await guildStore.getGuild(interaction.guildId);

    const embed = new EmbedBuilder()
      .setTitle('Joinlog Settings')
      .setDescription(
        `Dive into the expansive world of joinlog settings, granting you control and transparency over member joining and leaving activities. Customize and optimize your community's experience.`
      )
      .setColor('#0099ff')
      .setTimestamp();

    const select1 = new StringSelectMenuBuilder()
      .setCustomId('select1')
      .setPlaceholder('Toggle join and leave logs on and off.')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Enabled')
          .setDescription('Turn join logs on.')
          .setValue('enabled')
          .setEmoji('1078317580420382720')
          .setDefault(guildData.memberLogging.enabled ? true : false),

        new StringSelectMenuOptionBuilder()
          .setLabel('Disabled')
          .setDescription('Turn join logs off.')
          .setValue('disabled')
          .setEmoji('1078317593867325500')
          .setDefault(guildData.memberLogging.enabled ? false : true)
      );

    const logChannelName = (await interaction.guild.channels.fetch(guildData.memberLogging.logChannel)).name;

    const select2 = new ChannelSelectMenuBuilder()
      .setCustomId('select2')
      .setPlaceholder('Set the channel to log join logs.')
      .setChannelTypes(['GuildText'])
      .setPlaceholder(logChannelName ? `Current Log Channel: ${logChannelName}` : `Set the channel for join logs to be displayed.`);

    const select3 = new StringSelectMenuBuilder()
      .setCustomId('select3')
      .setPlaceholder('Set the actions to log in the channel.')
      .setMinValues(0)
      .setMaxValues(2)
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Member Joins')
          .setValue('memberjoins')
          .setDefault(guildData.memberLogging.actions.memberJoins ? true : false),
        new StringSelectMenuOptionBuilder()
          .setLabel('Member Leaves')
          .setValue('memberleaves')
          .setDefault(guildData.memberLogging.actions.memberLeaves ? true : false)
      );

    const actionRow1 = new ActionRowBuilder().addComponents(select1);
    const actionRow2 = new ActionRowBuilder().addComponents(select2);
    const actionRow3 = new ActionRowBuilder().addComponents(select3);

    interaction.reply({ embeds: [embed], components: [actionRow1, actionRow2, actionRow3], fetchReply: true }).then((msg) => {
      const collector = msg.createMessageComponentCollector({ time: 30_000 });

      collector.on('collect', (i) => {
        if (i.user.id !== interaction.user.id) {
          i.reply({ content: 'This is not your command to interact with!', ephemeral: true });
          return;
        }

        collector.resetTimer();
        switch (i.customId) {
          case 'select1':
            i.deferUpdate();

            guildData.memberLogging.enabled = i.values[0] === 'enabled' ? true : false;
            break;
          case 'select2':
            i.deferUpdate();

            guildData.memberLogging.logChannel = i.values[0];
            break;
          case 'select3':
            i.deferUpdate();

            guildData.memberLogging.actions.memberJoins = false;
            guildData.memberLogging.actions.memberLeaves = false;

            i.values.map((value) => {
              switch (value) {
                case 'memberjoins':
                  guildData.memberLogging.actions.memberJoins = true;
                  break;
                case 'memberleaves':
                  guildData.memberLogging.actions.memberLeaves = true;
                  break;
              }
            });
            break;
        }
        guildData.save();
      });
    });
  }
}
