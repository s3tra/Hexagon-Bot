export class BaseCommand {
  constructor(options) {
    this.commandName = options.commandName;
    this.displayName = options.displayName;
    this.commandDescription = options.commandDescription;
    this.commandCategory = options.commandCategory;
    this.commandPermissions = options.commandPermissions;
    this.commandOptions = options.commandOptions;
  }
}
