'use strict';

const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
const sprintf = require('sprintf-js').sprintf;
const {
  Broadcast: B,
  Room,
  Item,
  ItemType,
  Logger,
  Player, Broadcast
} = require('ranvier');
const ArgParser = require('../../lib/lib/ArgParser');
const ItemUtil = require('../../lib/lib/ItemUtil');

module.exports = {
  usage: "look [thing]",
  command: state => (args, player) => {
    if (!player.room || !(player.room instanceof Room)) {
      Logger.error(player.name + ' is in limbo.');
      return B.sayAt(player, 'You are in a deep, dark void.');
    }

    if (args) {
      Logger.verbose(`\t${player.name} looking at ${args}`);
      return lookEntity(state, player, args);
    }

    lookRoom(state, player);
  }
};


function lookRoom(state, player) {
  const room = player.room;
  let otherPlayers = '';

  //if (player.room.coordinates) {
   // B.sayAt(player, '[<b><white>' + sprintf('%s', room.title) + '</white></b>]');
  //}else{
  B.sayAt(player, '[<b><white>' + sprintf('%s', room.title) + '</white></b>]');
  //}

  // If the room has items, display them
  if(room.items.size > 0) {
    let $itemCollection = ' You also see ';

    // If there is exactly 1 item in the room
    if(room.items.size === 1) {
      room.items.forEach(item => {
        $itemCollection = $itemCollection + item.roomDesc+'. ';
      });
    } else {
      // In any other case (more than 1 item in the room) create an array from room.items set and iterate over it
      const itemsArray = Array.from(room.items);

      // If there are exactly 2 items in the room
      if(room.items.size === 2){
        itemsArray.forEach((item, key) => {
              if (key === itemsArray.length - 1) {
                $itemCollection = ' ' + $itemCollection + 'and ' + item.roomDesc + '.';
              } else {
                $itemCollection = ' ' + $itemCollection + item.roomDesc + ' ';
              }
            }
        );
      }else {
        // More than 2 items in the room
        itemsArray.forEach((item, key) => {
              //console.log(item, key);
              if (key === itemsArray.length - 1) {
                $itemCollection = ' ' + $itemCollection + 'and ' + item.roomDesc + '.';
              } else {
                $itemCollection = ' ' + $itemCollection + item.roomDesc + ', ';
              }
            }
        );
      }
    }
    B.sayAt(player, room.description+$itemCollection, 80);
  }else{
    B.sayAt(player, room.description, 80);
  }

  // show all players
  room.players.forEach(otherPlayer => {
    if (otherPlayer === player) {
      return;
    }
    let combatantsDisplay = '';
    if (otherPlayer.isInCombat()) {
      combatantsDisplay = getCombatantsDisplay(otherPlayer);
    }
    otherPlayers = otherPlayer.name + combatantsDisplay + ',';
  });

  let allNpcs = [];
  let combatantsDisplay = '';
  // show all npcs
  room.npcs.forEach(npc => {
    // show quest state as [!], [%], [?] for available, in progress, ready to complete respectively
    let hasNewQuest, hasActiveQuest, hasReadyQuest;
    if (npc.quests) {
      hasNewQuest = npc.quests.find(questRef => state.QuestFactory.canStart(player, questRef));
      hasReadyQuest = npc.quests.find(questRef => {
          return player.questTracker.isActive(questRef) &&
            player.questTracker.get(questRef).getProgress().percent >= 100;
      });
      hasActiveQuest = npc.quests.find(questRef => {
          return player.questTracker.isActive(questRef) &&
            player.questTracker.get(questRef).getProgress().percent < 100;
      });

      let questString = '';
      if (hasNewQuest || hasActiveQuest || hasReadyQuest) {
        questString += hasNewQuest ? '[<b><yellow>!</yellow></b>]' : '';
        questString += hasActiveQuest ? '[<b><yellow>%</yellow></b>]' : '';
        questString += hasReadyQuest ? '[<b><yellow>?</yellow></b>]' : '';
        B.at(player, questString + ' ');
      }
    }

    if (npc.isInCombat()) {
      combatantsDisplay = getCombatantsDisplay(npc);
    }
    allNpcs.push(' ' + npc.name);
  });

  if(allNpcs.length > 0 || otherPlayers.length > 0) {
    B.sayAt(player, 'Also here: ' + otherPlayers + allNpcs);
  }

  B.at(player, '<b>Obvious paths: </b>');


  const exits = room.getExits();
  const foundExits = [];

  // prioritize explicit over inferred exits with the same name
  for (const exit of exits) {
    if (foundExits.find(fe => fe.direction === exit.direction)) {
      continue;
    }
    if(!exit.hidden) {
      foundExits.push(exit);
    }
  }

  B.at(player, foundExits.map(exit => {
    const exitRoom = state.RoomManager.getRoom(exit.roomId);
    const door = room.getDoor(exitRoom) || (exitRoom && exitRoom.getDoor(room));
    if (door && (door.locked || door.closed)) {
      return '(' + exit.direction + ')';
    }

    return exit.direction;
  }).join(', '));

  if (!foundExits.length) {
    B.at(player, 'none');
  }
}

function lookEntity(state, player, args) {
  const room = player.room;
  args = args.split(' ');
  let search;

  if (args.length > 1 && args[0] === 'at') {
    search = args[0] === 'at' ? args[1] : args[0];
  } else if (args.length > 1 && args[0] === 'in') {
    search = args[0] === 'in' ? args[1] : args[0];
  } else {
    search = args[0];
  }

  let entity = ArgParser.parseDot(search, room.items);
  entity = entity || ArgParser.parseDot(search, room.players);
  entity = entity || ArgParser.parseDot(search, room.npcs);
  entity = entity || ArgParser.parseDot(search, player.inventory);
  entity = entity || ArgParser.parseDot(search, player.equipment);

  if (!entity) {
    return B.sayAt(player, "You don't see anything like that here.");
  }

  if (entity instanceof Player) {

    let pronoun = entity.sex === 'male' ? 'He' : 'She';
    // TODO: Show player equipment?
    B.sayAt(player, `You see ${entity.name} the ${entity.metadata.class}.`);
    B.sayAt(player, `${pronoun} appears to be a ${entity.race}.`);
    B.sayAt(player, `${pronoun} is ${entity.height}. ${pronoun} has ${entity.eyeColor} ${entity.eyeTrait} eyes and ${entity.skinTone} skin. ${pronoun} has ${entity.hairStyle} ${entity.hairTexture} ${entity.hairColor} hair ${entity.hairQuirk}. ${pronoun} has ${entity.faceFeature} face, a ${entity.noseDetail} nose, and ${entity.distinguishingMark}.`, 80);
    let equipmentTemp = [];
    let inventoryTemp = [];
    if(!entity.inventory){
      inventoryTemp.push(' nothing.');
    }else{
      for (const [, item] of entity.inventory) {
        inventoryTemp.push(ItemUtil.display(item));
      }
    }
    for(const [slot, item ] of entity.equipment)
    {
      equipmentTemp.push(ItemUtil.display(item));
    }
    if(inventoryTemp.length === 0){
        inventoryTemp.push(' nothing.');
    }
    if(equipmentTemp.length === 0){
        equipmentTemp.push(' nothing.');
    }
    Broadcast.sayAt(player, pronoun + ' is holding' + inventoryTemp, 80);
    Broadcast.sayAt(player, pronoun + ' is wearing' + equipmentTemp, 80);
    return;
  }

  B.sayAt(player, entity.description, 80);

  if (entity.timeUntilDecay) {
    B.sayAt(player, `You estimate that ${entity.name} will rot away in ${humanize(entity.timeUntilDecay)}.`);
  }

  const usable = entity.getBehavior('usable');
  if (usable) {
    if (usable.spell) {
      const useSpell = state.SpellManager.get(usable.spell);
      if (useSpell) {
        useSpell.options = usable.options;
        B.sayAt(player, useSpell.info(player));
      }
    }

    if (usable.effect && usable.config.description) {
      B.sayAt(player, usable.config.description);
    }

    if (usable.charges) {
      B.sayAt(player, `There are ${usable.charges} charges remaining.`);
    }
  }

  if (entity instanceof Item) {
    switch (entity.type) {
      case ItemType.WEAPON:
      case ItemType.ARMOR:
        return B.sayAt(player, ItemUtil.renderItem(state, entity, player));
      case ItemType.CONTAINER: {
        if (!entity.inventory || !entity.inventory.size) {
          return B.sayAt(player, `${entity.name} is empty.`);
        }

        if (entity.closed) {
          return B.sayAt(player, `It is closed.`);
        }

        B.at(player, 'Contents');
        if (isFinite(entity.inventory.getMax())) {
          B.at(player, ` (${entity.inventory.size}/${entity.inventory.getMax()})`);
        }
        B.sayAt(player, ':');

        let allItems = [];
        for (const [, item ] of entity.inventory) {
          allItems.push(item.name);
        }
        B.sayAt(player, allItems.join(', '), 80);
        break;
      }
    }
  }
}


function getCombatantsDisplay(entity) {
  const combatantsList = [...entity.combatants.values()].map(combatant => combatant.name);
  return `, <red>fighting </red>${combatantsList.join("<red>,</red> ")}`;
}
