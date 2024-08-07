import { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder } from 'discord.js';
import Mongoose from 'mongoose';
import FileService from 'fs';
import env from 'dotenv';
import axios from 'axios';

import { selectMenu } from './modules/SelectMenu.js';
import { closeTicket } from './modules/CloseTicket.js';
import { claimTicket } from './modules/ClaimTicket.js';
import { openTicket } from './modules/OpenTicket.js';
import { oldTickets } from './modules/OldTickets.js';
import { transcriptTicket } from './modules/TranscriptTicket.js';
import botStore from './database/BotStore.js';
import userStore from './database/UserStore.js';

env.config();

try {
  Mongoose.connect(process.env.MONGODB);
} catch (error) {
  console.error('Error connecting to the database:', error);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.User],
});

client.commands = new Collection();

async function setupCommands() {
  console.log('\x1b[96m Command Setup Running');

  // await client.application.commands.set([]);
  try {
    const commandFiles = FileService.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const CommandFile = (await import(`./commands/${file}`)).default;
      const command = new CommandFile();
      client.commands.set(command.commandName, command);

      client.application.commands.create({
        name: command.commandName,
        description: command.commandDescription,
        options: command.commandOptions,
      });
    }
  } catch (error) {
    console.error('An error occurred while loading the command files:', error);
  }

  const botData = await botStore.getBot('1078264877744930827', { create: false });  
  botData.commands = client.commands;
  botData.save();
}

async function setupEvents() {
  console.log('\x1b[96m Event Setup Running');

  try {
    const eventFiles = FileService.readdirSync('./src/events').filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
      const EventFile = (await import(`./events/${file}`)).default;
      const event = new EventFile();
      client.on(event.eventName, (...args) => {
        event.execute(client, args);
      });
    }
  } catch (error) {
    console.error('An error occurred while loading the event files:', error);
  }
}

async function initialize() {
  await setupCommands();
  setupEvents();
  oldTickets.start(client);
  selectMenu.start(client, EmbedBuilder);
  closeTicket.start(client, EmbedBuilder);
  openTicket.start(client, EmbedBuilder);
  claimTicket.start(client, EmbedBuilder);
  transcriptTicket.start(client, EmbedBuilder);
}

const updateBotData = async () => {
  try {
    const users = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
    const bots = client.guilds.cache.reduce((total, guild) => total + guild.members.cache.filter((member) => member.user.bot).size, 0);

    client.user.setActivity(`${users - bots} Users | ${client.guilds.cache.size} Guilds`);

    const botData = await botStore.getBot('1078264877744930827', { create: false });  

    botData.totalGuilds = client.guilds.cache.size.toString();

    console.log('\x1b[37m Before subtraction - Users:', users, 'Bots:', bots);
    botData.totalMembers = (users - bots).toString();

    console.log('\x1b[37m After subtraction - Total Members:', botData.totalMembers);
    botData.save();

    const botListServerCount = await axios.post(
      'https://api.botlist.me/api/v1/bots/1078264877744930827/stats',
      {
        server_count: client.guilds.cache.size,
      },
      {
        headers: {
          authorization: 'fWHTbwvVrWdHx4qqEBGT1FbU1WxXLK'
        }
      }
    );

    if (botListServerCount.data.error) {
      console.log('Unable to update botlist.me Server Count.');
    }

    const DBLServerCount = await axios.post(
      'https://discordbotlist.com/api/v1/bots/1078264877744930827/stats',
      {
        guilds: client.guilds.cache.size,
        users: (users - bots)
      },
      {
        headers: {
          authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoxLCJpZCI6IjEwNzgyNjQ4Nzc3NDQ5MzA4MjciLCJpYXQiOjE3MTA2OTQwOTZ9.8W_ARwkvngadSb1zylunPVtqAKlsNo7i2s3beQpsBRc'
        }
      }
    );
  
    if (DBLServerCount.data.error) {
      console.log('Unable to update discordbotlist.com Server/User Count.');
    }
  } catch (error) {
    console.log(error);
  }
};

const awardPremiumRole = async () => {
  const hexagonId = '1078263416667512862';
  const hexagonGuild = client.guilds.cache.get(hexagonId);
  const premiumRoleId = '1214242902943997963';
  
  if (hexagonGuild) {
      const premiumRole = hexagonGuild.roles.cache.get(premiumRoleId);
  
      if (premiumRole) {
          try {
              await hexagonGuild.members.fetch();
  
              hexagonGuild.members.cache.forEach(async (member) => {
                  const userData = await userStore.getUser(member.user.id);
                  if (userData && userData.isPremium === true) {
                      await member.roles.add(premiumRole);
                  }
              });
          } catch (error) {
              console.error('Error:', error);
          }
      } else {
          console.log('Premium role not found in the guild');
      }
  } else {
      console.log('Guild not found');
  }
}

const awardVerifiedRole = async () => {
  const hexagonId = '1078263416667512862';
  const hexagonGuild = client.guilds.cache.get(hexagonId);
  const verifiedRoleId = '1109899126134546504';
  
  if (hexagonGuild) {
      const verifiedRole = hexagonGuild.roles.cache.get(verifiedRoleId);
  
      if (verifiedRole) {
          try {
              await hexagonGuild.members.fetch();
  
              hexagonGuild.members.cache.forEach(async (member) => {
                if (member.user.bot) return;
                  const userData = await userStore.getUser(member.user.id);
                  if (userData) {
                      await member.roles.add(verifiedRole);
                  }
              });
          } catch (error) {
              console.error('Error:', error);
          }
      } else {
          console.log('Verified role not found in the guild');
      }
  } else {
      console.log('Guild not found');
  }
}

client.on('ready', async () => {
  const users = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
  const bots = client.guilds.cache.reduce((total, guild) => total + guild.members.cache.filter((member) => member.user.bot).size, 0);
  const finalUsers = Number(users - bots);
  client.user.setActivity(`${finalUsers} Users | ${client.guilds.cache.size} Guilds`);
  console.log('\x1b[94m Hexagon Bot Online');

  initialize();

  const intervalInMinutes = 15;
  
  await updateBotData();
  setInterval(updateBotData, intervalInMinutes * 60 * 1000);
  
  await awardPremiumRole();
  setInterval(awardPremiumRole, intervalInMinutes * 60 * 1000);

  await awardVerifiedRole();
  setInterval(awardVerifiedRole, intervalInMinutes * 60 * 1000);
});

client.login(process.env.TOKEN);