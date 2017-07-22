'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'lock <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'Lock which door?');
      }

      let exitDirection = args;
      const parts = args.split(' ');
      if (parts[0] === 'door' && parts.length >= 2) {
        exitDirection = parts[1];
      }

      const exit = state.RoomManager.findExit(player.room, exitDirection);

      if (!exit) {
        return B.sayAt(player, "There is no door there.");
      }

      const nextRoom = state.RoomManager.getRoom(exit.roomId);
      const door = nextRoom.getDoor(player.room);

      if (!door) {
        return B.sayAt(player, "That exit doesn't have a door.");
      }

      if (door.locked) {
        return B.sayAt(player, 'The door is already locked.');
      }

      if (!door.lockedBy) {
        return B.sayAt(player, "You can't lock that door.");
      }

      const playerKey = player.hasItem(door.lockedBy);
      if (!playerKey) {
        const keyItem = state.ItemFactory.getDefinition(door.lockedBy);
        if (!keyItem) {
          return B.sayAt(player, "You don't have the key.");
        }
        return B.sayAt(player, `The door can only be locked with ${keyItem.name}.`);
      }

      nextRoom.lockDoor(player.room);
      return B.sayAt(player, '*click* The door locks.');
    }
  };
};
