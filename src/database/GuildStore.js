import { Schema } from 'mongoose';
import { BaseStore } from '../BaseStore.js';

const guildSchema = new Schema({
  _id: { type: String },
  tickets: {
    blacklists: { type: Array, default: [] },
    enabled: { type: Boolean, default: false },
    category: { type: String, default: '' },
  },
  logging: {
    enabled: { type: Boolean, default: false },
    logChannel: { type: String, default: '' },
    actions: {
      guildBans: { type: Boolean, default: false },
      guildKicks: { type: Boolean, default: false },
      guildRoles: { type: Boolean, default: false },
      guildChannels: { type: Boolean, default: false },
      guildMessages: { type: Boolean, default: false },
      userRoles: { type: Boolean, default: false },
    },
  },
  memberLogging: {
    enabled: { type: Boolean, default: false },
    logChannel: { type: String, default: '' },
    actions: {
      memberJoins: { type: Boolean, default: false },
      memberLeaves: { type: Boolean, default: false },
    },
  },
  moderation: {
    modUsers: { type: [String], default: [] },
    modRoles: { type: [String], default: [] },
  },
  members: { type: Array, default: [] },
  ServerPublic: { type: Boolean, default: false },
  ticketResponse: { type: String, default: "Thank you for opening a ticket.\nWe're here to help. We will do our best to respond to you within 24hrs." }
});

class GuildStore extends BaseStore {
  constructor() {
    super(guildSchema, 'HexagonGuild');
  }

  async getGuild(id, options) {
    const guild = await this.model.findOne({ _id: id });

    let create = options?.create;
    if (create === undefined) create = true;
    if (!guild && create === true) return await this.createGuild({ _id: id });
    else return guild;
  }

  async createGuild(data) {
    let guild;
    try {
      guild = await this.model.create(data);
    } catch (err) {
      guild = await this.getGuild(data._id);
    }
    return guild;
  }

  async deleteGuild(id) {
    return await this.model.deleteOne({ _id: id });
  }
}

export default new GuildStore();
