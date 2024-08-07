import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import guildStore from '../database/GuildStore.js';

export default class ListModsCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'listmods',
      displayName: 'List Mods',
      commandDescription: 'Lists current guild moderation users and roles.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: null,
    });
  }

  async execute(interaction) {
    const guildData = await guildStore.getGuild(interaction.guild.id);

    const embed = new EmbedBuilder().setColor('#0099ff');

    const components = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select1')
        .setPlaceholder('Select which type of moderator.')
        .addOptions(
          new StringSelectMenuOptionBuilder().setValue('modusers').setLabel('Mod Users'),
          new StringSelectMenuOptionBuilder().setValue('modroles').setLabel('Mod Roles')
        )
    );
    let current;

    if (guildData.moderation.modUsers.length > 0) current = 'users';
    else if (guildData.moderation.modRoles.length > 0) current = 'roles';
    else current = 'users';

    function setEmbedData() {
      if (current === 'users') {
        embed.setTitle('Moderation Users');
        components.components[0].options[0].data.default = true;
        components.components[0].options[1].data.default = false;

        if (guildData.moderation.modUsers.length === 0) embed.setDescription('No mod users in this guild.');
        else {
          guildData.moderation.modUsers.forEach((user) => {
            embed.addFields([{ value: `<@${user}>`, name: 'Mod User' }]);
          });
        }
      } else if (current === 'roles') {
        embed.setTitle('Moderation Roles');
        components.components[0].options[1].data.default = true;
        components.components[0].options[0].data.default = false;

        if (guildData.moderation.modRoles.length === 0) embed.setDescription('No mod roles in this guild.');
        else {
          let roleArray = [];
          let lastRolePosition;
          guildData.moderation.modRoles.forEach((role) => {
            const guildRole = interaction.guild.roles.cache.get(`${role}`);
            if (!guildRole) return console.log('Unable to find guild role. Listmods - 58');
            
            if (lastRolePosition && lastRolePosition < guildRole.rawPosition) {
              const insertIndex = roleArray.findIndex((roleId) => {
                const insertRole = interaction.guild.roles.cache.get(`${roleId}`);
                return insertRole.rawPosition < guildRole.rawPosition;
              });
              
              if (insertIndex !== -1) {
                roleArray.splice(insertIndex, 0, role);
              } else {
                roleArray.push(role);
              };
            } else {
              roleArray.push(role);
            }; 
            lastRolePosition = guildRole.rawPosition;
          });
          roleArray.forEach((role) => {
            embed.addFields([{ value: `<@&${role}>`, name: 'Mod Role' }]);
          });
        }
      }
    }

    setEmbedData();

    interaction.reply({ embeds: [embed], components: [components], fetchReply: true, ephemeral: true }).then((message) => {
      const collector = message.createMessageComponentCollector({ time: 30000 });

      collector.on('collect', (i) => {
        if (i.user.id !== interaction.user.id) return i.reply({ content: 'This is not your interaction.', ephemeral: true });
        if (i.values[0] === 'modusers') {
          current = 'users';
          components.components[0].options[0].data.default = true;
          components.components[0].options[1].data.default = false;
        } else if (i.values[0] === 'modroles') {
          current = 'roles';
          components.components[0].options[1].data.default = true;
          components.components[0].options[0].data.default = false;
        }
        embed.setFields();
        setEmbedData();
        collector.resetTimer();
        i.deferUpdate();
        interaction.editReply({ embeds: [embed], components: [components] });
      });
    });
  }
}
