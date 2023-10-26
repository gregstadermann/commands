'use strict';

const { Broadcast } = require('ranvier');
const { CommandParser } = require('../../lib/lib/CommandParser');

module.exports = {
    usage: 'go <room>',
    command: (state) => (args, player) => {
        if (!args || !args.length) {
            return Broadcast.sayAt(player, 'Where are you trying to go?');
        }

        let direction = args;
        let roomExit = null;

        roomExit = CommandParser.canGo(player, direction);
        if (!roomExit) {
            return Broadcast.sayAt(player, "You can't go that way!");
        }

        const targetRoom = state.RoomManager.getRoom(roomExit.roomId);

        player.moveTo(targetRoom, () => {
            Broadcast.sayAt(player, '<b><green>You walk'+direction+'</green></b>\r\n');
            state.CommandManager.get('look').execute('', player);
        });

    }
};
