'use strict';

const { Broadcast } = require('ranvier');
const ItemUtil = require('../../lib/lib/ItemUtil');

module.exports = {
  usage: 'inventory',
  command : (state) => (args, player) => {
    if (!player.inventory || !player.inventory.size) {
      return Broadcast.sayAt(player, "You aren't carrying anything.");
    }

    Broadcast.at(player, "You are carrying");
    if (isFinite(player.inventory.getMax())) {
      Broadcast.at(player, ` (${player.inventory.size}/${player.inventory.getMax()})`);
    }
    Broadcast.sayAt(player, ':');

    // TODO: Implement grouping
    const allPlayerItems = function() {
      let equipmentTemp = [];
      let inventoryTemp = [];

      for (const [, item] of player.inventory) {
        inventoryTemp.push(ItemUtil.display(item));
      }
      for(const [slot, item ] of player.equipment)
      {
        equipmentTemp.push(ItemUtil.display(item));
      }
      Broadcast.sayAt(player, equipmentTemp+', '+inventoryTemp);
    };



    if (!player.equipment.size) {
      return Broadcast.sayAt(player, "You are completely naked!");
    }
    allPlayerItems();
    Broadcast.sayAt(player, "You are wearing ");
    for (const [slot, item] of player.equipment) {
      Broadcast.sayAt(player, `  <${slot}> ${ItemUtil.display(item)}`);
    }
  }
};
