'use strict';

const { Broadcast } = require('ranvier');
const ItemUtil = require('../../lib/lib/ItemUtil');

module.exports = {
  usage: 'inventory',
  command : (state) => {
    return (args, player) => {
      let equipmentTemp = [];
      let inventoryTemp = [];
      let inventoryMessage = '';
      let emptyMessage = '';
      let nakedMessage = '';

      if (!player.inventory || !player.inventory.size) {
        //inventoryTemp.push("nothing in your hands.");
        emptyMessage = "You aren't carrying anything in your hands.";
        Broadcast.sayAt(player, emptyMessage);
      }else{
        for (const [, item] of player.inventory) {
          inventoryTemp.push(ItemUtil.display(item));
        }
        inventoryMessage = 'You are holding' + inventoryTemp[0] + ' in your right hand';
        if(inventoryTemp[1]) {
          inventoryMessage = inventoryMessage + ' and' + inventoryTemp[1] + ' in your left hand.';
        }
        Broadcast.sayAt(player, inventoryMessage, 80);
        //Broadcast.sayAt(player, "You are holding" + inventoryTemp[0] + "in your right hand and" + inventoryTemp[1] + "in your left hand.");
      }

      if (!player.equipment || !player.equipment.size) {
        //equipmentTemp.push("nothing");
        nakedMessage = "You aren't wearing anything.";
        Broadcast.sayAt(player, nakedMessage);
      }else{
        for (const [slot, item] of player.equipment) {
          equipmentTemp.push(ItemUtil.display(item));
        }
        Broadcast.sayAt(player, "You are wearing" + equipmentTemp, 80);
      }

    };
  }
};
