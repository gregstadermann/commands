'use strict';

const { Broadcast } = require('ranvier');
const { CommandParser } = require('../../lib/lib/CommandParser');

module.exports = {
    usage: 'go <room>',
    command: (state) => (args, player) => {
        if (!args || !args.length) {
            return Broadcast.sayAt(player, 'Must specify a destination');
        }

        let direction = args;
        let roomExit = null;

        roomExit = CommandParser.canGo(player, direction);
        const targetRoom = state.RoomManager.getRoom(roomExit.roomId);

        player.moveTo(targetRoom, () => {
            Broadcast.sayAt(player, '<b><green>You snap your finger and instantly appear in a new room.</green></b>\r\n');
            state.CommandManager.get('look').execute('', player);
        });

    }
};
