'use strict';

const { Broadcast } = require('ranvier');
const {Broadcast: B} = require("../../../../gemstone3-core");

/**
 * Change player's stance
 */
module.exports = {
    usage: 'stance [stance]',
    command : (state) => (args, player) => {
        const stance = player.stance;
        if(!args){
            Broadcast.sayAt(player, 'Your current stance is: ' + stance);
        }
        if(args){
            if(args === 'o' || args === 'off'){}
           return changeStance(state, player, args);
        }
    }
};
function changeStance(state, player, args) {
    const stance = player.stance;
    let newStance = args;
    if(stance === newStance){
        Broadcast.sayAt(player, 'You are already in ' + stance + ' stance.');
        return;
    }
    if(newStance === 'o' || newStance === 'off'){ newStance = 'offensive'; }
    if(newStance === 'd' || newStance === 'def'){ newStance = 'defensive'; }
    if(newStance === 'g' || newStance === 'guard'){ newStance = 'guarded'; }
    if(newStance === 'a' || newStance === 'adv'){ newStance = 'advance'; }
    if(newStance === 'f' || newStance === 'for'){ newStance = 'forward'; }
    if(newStance === 'n' || newStance === 'neu'){ newStance = 'neutral'; }

    if(newStance === 'offensive' || newStance === 'defensive' || newStance === 'guarded' || newStance === 'advance' || newStance === 'forward' || newStance === 'neutral'){
        if(player.combatData.lag > 0) {
            return B.sayAt(player, `You are can't change stance now! Wait ${Math.round(player.combatData.lag/1000)} more seconds.`);
        }
        Broadcast.sayAt(player, 'You are now in ' + newStance + ' stance.');
        player.stance = newStance;
    }else{
        return Broadcast.sayAt(player, 'That is not a valid stance.');
    }
}
