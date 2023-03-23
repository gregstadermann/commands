'use strict';

const sprintf = require('sprintf-js').sprintf;
const { Broadcast: B, Logger } = require('ranvier');
const Combat = require('../../combat/lib/Combat');

module.exports = {
  aliases: [ 'stats' ],
  command : (state) => (args, p) => {
    const say = message => B.sayAt(p, message);

    say('<b>' + B.center(60, `${p.name}, level ${p.level} ${p.playerClass.config.name}`, 'green'));
    say('<b>' + B.line(60, '-', 'green'));

    let stats = {
      strength: 0,
      agility: 0,
      aura: 0,
      constitution: 0,
      dexterity: 0,
      discipline: 0,
      charisma: 0,
      intuition: 0,
      intelligence: 0,
      wisdom: 0,
      stamina: 0,
      armor: 0,
      health: 0,
      critical: 0,
      AS: 0,
      DS: 0,
      'edged weapons': 0,
      'armor use': 0,
    };

    for (const stat in stats) {
      stats[stat] = {
        current: p.getAttribute(stat) || 0,
        base: p.getBaseAttribute(stat) || 0,
        max: p.getMaxAttribute(stat) || 0,
      };
    }

    B.at(p, sprintf(' %-9s: %12s', 'Health', `${stats.health.current}/${stats.health.max}`));
    say('<b><green>' + sprintf(
      '%36s',
      'Weapon '
    ));

    // class resource
    switch (p.playerClass.id) {
      case 'warrior':
        const energy = {
          current: p.getAttribute('energy'),
          max: p.getMaxAttribute('energy')
        };
        B.at(p, sprintf(' %-9s: %12s', 'Energy', `${energy.current}/${energy.max}`));
        break;
      case 'mage':
        const mana = {
          current: p.getAttribute('mana'),
          max: p.getMaxAttribute('mana')
        };
        B.at(p, sprintf(' %-9s: %12s', 'Mana', `${mana.current}/${mana.max}`));
        break;
      case 'paladin':
        const favor = {
          current: p.getAttribute('favor'),
          max: p.getMaxAttribute('favor')
        };
        B.at(p, sprintf(' %-9s: %12s', 'Favor', `${favor.current}/${favor.max}`));
        break;
      default:
        B.at(p, B.line(24, ' '));
        break;
    }
    say(sprintf('%35s', '.' + B.line(22)) + '.');

    B.at(p, sprintf('%37s', '|'));
    const weaponDamage = Combat.getWeaponDamage(p);
    const min = Combat.normalizeWeaponDamage(p, weaponDamage.min);
    const max = Combat.normalizeWeaponDamage(p, weaponDamage.max);
    say(sprintf(' %6s:<b>%5s</b> - <b>%-5s</b> |', 'Damage', min, max));
    B.at(p, sprintf('%37s', '|'));
    say(sprintf(' %6s: <b>%12s</b> |', 'Speed', B.center(12, Combat.getWeaponSpeed(p) + ' sec')));

    say(sprintf('%60s', "'" + B.line(22) + "'"));

    say('<b><green>' + sprintf(
      '%-27s',
      ' Stats'
    ) + '</green></b>');
    say('.' + B.line(25) + '.');


    const printStat = (stat, newline = true) => {
      const val = stats[stat];
      if(stat.metadata){
        Logger.verbose(stat.metadata);
      }
      const statColor = (val.current > val.base ? 'green' : 'white');
      const str = sprintf(
        `| %-12s : <b><${statColor}>%8s</${statColor}></b> |`,
        stat[0].toUpperCase() + stat.slice(1),
        val.current
      );

      if (newline) {
        say(str);
      } else {
        B.at(p, str);
      }
    };

    printStat('strength', false); // left
    say('<b><green>' + sprintf('%30s', 'Gold ')); // right
    printStat('agility', false); // left
    say(sprintf('%33s', '.' + B.line(12) + '.')); // right
    printStat('intelligence', false); // left
    say(sprintf('%19s| <b>%10s</b> |', '', p.getMeta('currencies.gold') || 0)); // right
    printStat('stamina', false); // left
    say(sprintf('%33s', "'" + B.line(12) + "'")); // right
    printStat('discipline', true); // left
    printStat('constitution', true); // left
    printStat('dexterity', true); // left
    printStat('charisma', true); // left
    printStat('intuition', true); // left
    printStat('wisdom', true); // left
    printStat('aura', true); // left
    say("'" + B.line(25) + "'");

    say(':' + B.line(25) + ':');
    printStat('armor');
    printStat('critical');
    printStat('AS');
    printStat('DS');
    printStat('edged weapons');
    printStat('armor use');
    say("'" + B.line(25) + "'");
  }
};
