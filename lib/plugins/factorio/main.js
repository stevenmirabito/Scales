/**
 * Scales.js — the flexible game management daemon built for PufferPanel.
 * Licensed under a GPL-v3 license.
 *
 * factorio.js — Adds Factorio Dedicated Server support to Scales.js
 */
require('date-utils');
var Rfr = require('rfr');
var Logger = Rfr('lib/logger.js');
var Util = require('util');
var Core = Rfr('lib/plugins/core/main.js');
var StringUtils = Rfr('lib/utils/stringutils.js');

/**
 * Establishes the plugin function and makes constants available across the entire function.
 * @param {object} preflight new Preflight();
 */
var Plugin = function (root, public, config, docker) {

    this.serverConfig = config;
    this.rootPath = root;
    this.publicPath = public;
    this.settings = Rfr('lib/plugins/factorio/config.json');
    this.query = {};

    this.CorePlugin = new Core(this);
};

/**
 * Queries the specified server.
 * The Factorio server has no way to give us this information at the moment, so send back what we can.
 * @return {bool}
 */
Plugin.prototype.queryServer = function (next) {

    this.query = {};
    this.query.hostname = null;
    this.query.numplayers = null;
    this.query.maxplayers = 65535; // Hardcoded: https://wiki.factorio.com/index.php?title=Multiplayer
    this.query.map = null;
    this.query.players = null;
    this.query.plugins = '';
    this.query.version = null;
    this.query.type = null;
    this.query.time = new Date().getTime();

    self.query = query;
    return next();

};

/**
 * Runs the plugin PreFlight before attempting to start the server.
 * Checks for basic mistakes in configuration or other issues with the files.
 * @param {callback}
 * @return {callback} Returns results in a callback next()
 */
Plugin.prototype.preflight = function (next) {

    var self = this;

    // Is a save file defined for this server?
    if (typeof self.serverConfig.startup.variables.save_file === 'undefined') {
        Logger.error('No save file is defined for ' + self.serverConfig.name);
        return next(new Error('No save file is defined for ' + self.serverConfig.name));
    }

    // Does the save file actually exist on the system?
    if (!Fs.existsSync(Path.join(self.publicPath, 'factorio/saves/', self.serverConfig.startup.variables.save_file))) {
        Logger.error(self.serverConfig.startup.variables.save_file + ' does not seem to be in the saves directory for ' + self.serverConfig.name);
        return next(new Error(self.serverConfig.startup.variables.save_file + ' does not seem to be in the saves directory for ' + self.serverConfig.name));
    } else {
        // Everything checks out, continue
        return next();
    }

};

Plugin.prototype.startup = function () {

    var self = this;

    if (self.serverConfig.startup.command.lastIndexOf('--start-server', 0) !== 0) {
        self.serverConfig.startup.command = '--start-server ' + self.serverConfig.startup.command;
    }

    for (var index in self.serverConfig.startup.variables) {
        startupArray = startupArray.replace(new RegExp(StringUtils.escapeRegExp('${' + index + '}'), 'gi'), self.serverConfig.startup.variables[index]);
    }

    return startupArray;

};

module.exports = Plugin;
