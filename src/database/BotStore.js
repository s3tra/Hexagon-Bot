import { Schema } from 'mongoose';
import { BaseStore } from '../BaseStore.js';

const botSchema = new Schema({
  _id: { type: String },
  totalClosedTickets: { type: String, default: 0 },
  totalMembers: { type: String, default: 0 },
  totalGuilds: { type: String, default: 0 },
  commands: { type: Array, default: [] }
});

class BotStore extends BaseStore {
  constructor() {
    super(botSchema, 'HexagonBot');
  }

  async getBot(id, options) {
    const bot = await this.model.findOne({ _id: id });
    let create = options?.create;
    if (create === undefined) create = true;
    if (!bot && create === true) return await this.createBot(id);
    else return bot;
  }

  async createBot(id) {
    return await this.model.create({ _id: id });
  }
}

export default new BotStore();