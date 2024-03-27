'use strict';

const { Broadcast } = require('ranvier');
const { CommandParser } = require('../../lib/lib/CommandParser');
const {Broadcast: B} = require("../../../../gemstone3-core");

module.exports = {
    usage: 'go <room>',
    command: (state) => (args, player) => {
        if (!args || !args.length) {
            return Broadcast.sayAt(player, 'Where are you trying to go?');
        }
        let oldRoom = player.room;
        let direction = args;
        let roomExit = null;

        roomExit = CommandParser.canGo(player, direction);
        if (!roomExit) {
            return Broadcast.sayAt(player, "You can't go there.");
        }

        const targetRoom = state.RoomManager.getRoom(roomExit.roomId);

        player.moveTo(targetRoom, () => {
            Broadcast.sayAt(player, '<b><green>You walk towards the '+direction+'</green></b>\r\n');

            Broadcast.sayAt(oldRoom, `${player.name} just went towards the ${roomExit.direction}.`);
            Broadcast.sayAtExcept(targetRoom, `${player.name} just arrived.`, player);
            state.CommandManager.get('look').execute('', player);
        });

    }
};
