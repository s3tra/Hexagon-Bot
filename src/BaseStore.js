import mongoose from 'mongoose';

export class BaseStore {
  constructor(schema, modelName) {
    this.schema = schema;

    this.model = mongoose.model(modelName, schema);
  }
}
