'use strict';

const { Broadcast } = require('ranvier');
const LevelUtil = require('../../lib/lib/LevelUtil');

module.exports = {
  aliases: [ 'level', 'experience' ],
  usage: 'tnl',
  command: state => (args, player) => {
    console.log('Player level: ', player.level);
    const totalTnl = LevelUtil.expToLevel(player.level + 1, player.level);
    console.log('Player.expericne - Total TNL:', player.experience, totalTnl);
    //const currentPerc = player.experience ? Math.floor((player.experience / totalTnl) * 100) : 0;
    const currentPerc = player.experience ? Math.floor((player.experience / totalTnl) * 100) : 0;
    console.log('Current Percent:', currentPerc);

    Broadcast.sayAt(player, `Level: ${player.level}`);
    Broadcast.sayAt(player, Broadcast.progress(80, currentPerc, "blue"));
    Broadcast.sayAt(player, `${player.experience}/${totalTnl} (${currentPerc}%, ${totalTnl - player.experience} til next level)`);
  }
};
