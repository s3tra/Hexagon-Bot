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
      commandName: 'modlogs',
      displayName: 'Modlogs',
      commandDescription: 'Set moderation logging settings.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: [],
    });
  }

  async execute(interaction) {
    const guildData = await guildStore.getGuild(interaction.guildId);

    const embed = new EmbedBuilder()
      .setTitle('Modlog Settings')
      .setDescription(
        `Dive into the expansive world of modlog settings, granting you control and transparency over moderation activities. Customize and optimize your community's experience.`
      )
      .setColor('#0099ff')
      .setTimestamp();

    const select1 = new StringSelectMenuBuilder()
      .setCustomId('select1')
      .setPlaceholder('Toggle moderation logging on and off.')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Enabled')
          .setDescription('Turn moderation logging on.')
          .setValue('enabled')
          .setEmoji('1078317580420382720')
          .setDefault(guildData.logging.enabled ? true : false),

        new StringSelectMenuOptionBuilder()
          .setLabel('Disabled')
          .setDescription('Turn moderation logging off.')
          .setValue('disabled')
          .setEmoji('1078317593867325500')
          .setDefault(guildData.logging.enabled ? false : true)
      );

    const logChannelName = (await interaction.guild.channels.fetch(guildData.logging.logChannel)).name;

    const select2 = new ChannelSelectMenuBuilder()
      .setCustomId('select2')
      .setPlaceholder('Set the channel to log moderation logs.')
      .setChannelTypes(['GuildText'])
      .setPlaceholder(
        logChannelName ? `Current Log Channel: ${logChannelName}` : `Set the channel for moderation logs to be displayed.`
      );

    const select3 = new StringSelectMenuBuilder()
      .setCustomId('select3')
      .setPlaceholder('Set the commands to log in the channel.')
      .setMinValues(0)
      .setMaxValues(6)
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Guild Bans')
          .setValue('guildbans')
          .setDefault(guildData.logging.actions.guildBans ? true : false),
        new StringSelectMenuOptionBuilder()
          .setLabel('Guild Kicks')
          .setValue('guildkicks')
          .setDefault(guildData.logging.actions.guildKicks ? true : false),
        new StringSelectMenuOptionBuilder()
          .setLabel('Guild Roles')
          .setValue('guildroles')
          .setDefault(guildData.logging.actions.guildRoles ? true : false),
        new StringSelectMenuOptionBuilder()
          .setLabel('Guild Channels')
          .setValue('guildchannels')
          .setDefault(guildData.logging.actions.guildChannels ? true : false),
        new StringSelectMenuOptionBuilder()
          .setLabel('Guild Messages')
          .setValue('guildmessages')
          .setDefault(guildData.logging.actions.guildMessages ? true : false),
        new StringSelectMenuOptionBuilder()
          .setLabel('User Roles')
          .setValue('userroles')
          .setDefault(guildData.logging.actions.userRoles ? true : false)
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

            guildData.logging.enabled = i.values[0] === 'enabled' ? true : false;
            break;
          case 'select2':
            i.deferUpdate();

            guildData.logging.logChannel = i.values[0];
            break;
          case 'select3':
            i.deferUpdate();

            guildData.logging.actions.guildBans = false;
            guildData.logging.actions.guildKicks = false;
            guildData.logging.actions.guildRoles = false;
            guildData.logging.actions.guildChannels = false;
            guildData.logging.actions.guildMessages = false;
            guildData.logging.actions.userRoles = false;

            i.values.map((value) => {
              switch (value) {
                case 'guildbans':
                  guildData.logging.actions.guildBans = true;
                  break;
                case 'guildkicks':
                  guildData.logging.actions.guildKicks = true;
                  break;
                case 'guildroles':
                  guildData.logging.actions.guildRoles = true;
                  break;
                case 'guildchannels':
                  guildData.logging.actions.guildChannels = true;
                  break;
                case 'guildmessages':
                  guildData.logging.actions.guildMessages = true;
                  break;
                case 'userroles':
                  guildData.logging.actions.userRoles = true;
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
