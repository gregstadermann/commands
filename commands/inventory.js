'use strict';

const { Broadcast } = require('ranvier');
const ItemUtil = require('../../lib/lib/ItemUtil');

module.exports = {
  usage: 'inventory',
  command : (state) => {
    return (args, player) => {
      let equipmentTemp = [];
      let inventoryTemp = [];
      if (!player.inventory || !player.inventory.size) {
        inventoryTemp.push("nothing");
      }else{
        for (const [, item] of player.inventory) {
          inventoryTemp.push(ItemUtil.display(item));
        }
      }

      if (!player.equipment || !player.equipment.size) {
        equipmentTemp.push("nothing");
      }else{
        for (const [slot, item] of player.equipment) {
          equipmentTemp.push(ItemUtil.display(item));
        }
      }

      Broadcast.sayAt(player, "You are holding " + inventoryTemp);
      Broadcast.sayAt(player, "You are wearing " + equipmentTemp);
    };
  }
};
