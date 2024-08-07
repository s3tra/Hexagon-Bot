import { Schema } from 'mongoose';
import { BaseStore } from '../BaseStore.js';

const userSchema = new Schema({
  _id: { type: String },
  badges: { type: Array, default: [] },
  commandsRan: { type: Number, default: 0 },
  starRating: { type: String, default: '0'},
  allTimeTotalStarRatings: { type: Number, default: 0 },
  totalStarRatings: {
    allTimeFive: { type: Number, default: 0 },
    allTimeFour: { type: Number, default: 0 },
    allTimeThree: { type: Number, default: 0 },
    allTimeTwo: { type: Number, default: 0 },
    allTimeOne: { type: Number, default: 0 }
  },
  guildTicketProfile: { type: Object, default: {} },
  ticketsHandled: { type: String, default: '0' },
  isPremium: { type: Boolean, default: false },
});

class UserStore extends BaseStore {
  constructor() {
    super(userSchema, 'HexagonUser');
  }

  async getUser(id, options) {
    const user = await this.model.findOne({ _id: id });
    let create = options?.create;
    if (create === undefined) create = true;
    if (!user && create === true) return await this.createUser(id);
    else return user;
  }

  async createUser(id) {
    let user;
    try {
      user = await this.model.create({ _id: id });
    } catch (err) {
      user = await this.getUser(id);
    }
    return user;
  }
}

export default new UserStore();