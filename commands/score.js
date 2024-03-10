'use strict';

const sprintf = require('sprintf-js').sprintf;
const { Broadcast: B, Logger } = require('ranvier');
const Combat = require('../../combat/lib/Combat');

module.exports = {
  aliases: [ 'stats', 'info' ],
  command : (state) => (args, p) => {
    const say = message => B.sayAt(p, message);

    say('<b>' + B.center(60, `${p.name}, level ${p.level} ${p.sex} ${p.race} ${p.playerClass.config.name}`, 'green'));
    say('<b>' + B.line(60, '-', 'green'));

    let stats = {
      strength: 0,
      logic: 0,
      aura: 0,
      constitution: 0,
      dexterity: 0,
      reflexes: 0,
      discipline: 0,
      charisma: 0,
      intelligence: 0,
      wisdom: 0,
      health: 0,
      brawling: 0,
      one_handed_edged: 0,
      one_handed_blunt: 0,
      two_handed: 0,
      polearm: 0,
      ranged: 0,
      thrown: 0,
      combat_maneuvers: 0,
      armor_use: 0,
      shield_use: 0,
      climbing: 0,
      swimming: 0,
      disarm_traps: 0,
      pick_locks: 0,
      stalk_and_hide: 0,
      perception: 0,
      ambush: 0,
      spell_aim: 0,
      physical_training: 0,
      mana_share: 0,
      magic_item_use: 0,
      scroll_reading: 0,
      harness_power: 0,
      first_aid: 0,
      major_elemental: 0,
      minor_elemental: 0,
      major_spiritual: 0,
      minor_spiritual: 0,
      cleric_base: 0,
      wizard_base: 0,
      empath_base: 0,
      sorcerer_base: 0,
      ranger_base: 0,
    };

    for (const stat in stats) {
      stats[stat] = {
        current: p.getAttribute(stat) || 0,
        base: p.getBaseAttribute(stat) || 0,
        max: p.getMaxAttribute(stat) || 0,
      };
    }

    say(sprintf(' %-9s: %12s', 'Health', `${stats.health.current}/${stats.health.max}`));
    say(sprintf(' %-9s: %12s', 'TPs', `[ ${p.tps[0]}/${p.tps[1]} ]`));
    say('<b><green>' + sprintf(
      '%60s',
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
    say(sprintf('%35s', '.' + B.line(22)) + '-');

    B.at(p, sprintf('%37s', '|'));
    const weaponDamage = Combat.getWeaponDamage(p);
    const weapon = Combat.findWeapon(p) || { metadata: {} };
    let weaponType = weapon.metadata.weapon_type || 'none';
    let baseWeapon = weapon.metadata.baseWeapon || 'none';
    const min = Combat.normalizeWeaponDamage(p, weaponDamage.min);
    const max = Combat.normalizeWeaponDamage(p, weaponDamage.max);
    say(sprintf(' %6s', baseWeapon));
    B.at(p, sprintf('%37s', '|'));
    say(sprintf(' %6s', weaponType));
    B.at(p, sprintf('%37s', '|'));
    say(sprintf(' %6s:<b>%5s</b> - <b>%-5s</b>', 'Damage', min, max));
    B.at(p, sprintf('%37s', '|'));
    say(sprintf(' %6s: <b>%12s</b>', 'Speed', B.center(12, Combat.getWeaponSpeed(p) + ' sec')));

    say(sprintf('%60s', "'" + B.line(22) + "-"));

    // Begin Stats Section
    say('<b><green>' + sprintf(
      '%-27s',
      ' Stats'
    ) + '</green></b>');
    say('.' + B.line(26) + '.');


    const printStat = (stat, newline = true) => {
      const val = stats[stat];
      const bonus = p.getSkillBonus(stat);
      console.log(val, bonus);

      if(val === undefined) {
        return;
      }

      if(val.current === 0 && val.base === 0) {
        return;
      }

      if(stat.metadata){
        Logger.verbose(stat.metadata);
      }
      const statColor = (val.current > val.base ? 'green' : 'white');
      const str = sprintf(
        `| %-17s : <b><${statColor}>%4s</${statColor}></b> |`,
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
    printStat('logic', false); // left
    say(sprintf('%33s', '.' + B.line(12) + '.')); // right
    printStat('intelligence', false); // left
    say(sprintf('%19s| <b>%10s</b> |', '', p.getMeta('currencies.gold') || 0)); // right
    printStat('reflexes', false); // left
    say(sprintf('%33s', "'" + B.line(12) + "'")); // right
    printStat('discipline', true); // left
    printStat('constitution', true); // left
    printStat('dexterity', true); // left
    printStat('charisma', true); // left
    printStat('wisdom', true); // left
    printStat('aura', true); // left
    say("'" + B.line(26) + "'");
    say('');

    // Begin Skills Section

    const printSkill = (stat, newline = true) => {
      const val = stats[stat];
      const bonus = p.getSkillBonus(stat);

      if(val === undefined) {
        return;
      }

      if(val.current === 0 && val.base === 0) {
        return;
      }

      if(stat.metadata){
        Logger.verbose(stat.metadata);
      }
      const statColor = (val.current > val.base ? 'green' : 'white');
      const str = sprintf(
          `| %-17s : <b><${statColor}>%4s</${statColor}> (+%s)</b> |`,
          stat[0].toUpperCase() + stat.slice(1),
          val.current,
          bonus
      );

      if (newline) {
        say(str);
      } else {
        B.at(p, str);
      }
    };

    say('<b><green>' + sprintf(
        '%-27s',
        ' Skills'
    ) + '</green></b>');
    say("." + B.line(31) + ".");
    printSkill('one_handed_edged', true); // left
    printSkill('one_handed_blunt', true); // left
    printSkill('two_handed', true); // left
    printSkill('polearm', true); // left
    printSkill('ranged', true); // left
    printSkill('thrown', true); // left
    printSkill('brawling', true); // left
    printSkill('combat_maneuvers', true); // left
    printSkill('armor_use', true); // left
    printSkill('shield_use', true); // left
    printSkill('climbing', true); // left
    printSkill('swimming', true); // left
    printSkill('disarm_traps', true); // left
    printSkill('pick_locks', true); // left
    printSkill('stalk_and_hide', true); // left
    printSkill('perception', true); // left
    printSkill('ambush', true); // left
    printSkill('spell_aim', true); // left
    printSkill('physical_training', true); // left
    printSkill('mana_share', true); // left
    printSkill('magic_item_use', true); // left
    printSkill('scroll_reading', true); // left
    printSkill('harness_power', true); // left
    printSkill('first_aid', true); // left
    say("'" + B.line(31) + "'");
    say('');

    // Begin Spells Section
    const printSpell = (stat, newline = true) => {
      const val = stats[stat];

      if(val === undefined) {
        return;
      }

      if(val.current === 0 && val.base === 0) {
        return;
      }

      if(stat.metadata){
        Logger.verbose(stat.metadata);
      }
      const statColor = (val.current > val.base ? 'green' : 'white');
      const str = sprintf(
          `| %-17s : <b><${statColor}>%9s</${statColor}></b> |`,
          stat[0].toUpperCase() + stat.slice(1),
          val.current
      );

      if (newline) {
        say(str);
      } else {
        B.at(p, str);
      }
    };
    say('<b><green>' + sprintf(
        '%-31s',
        ' Spells'
    ) + '</green></b>');
    say("." + B.line(31) + ".");
    printSpell('major_elemental', true); // left
    printSpell('minor_elemental', true); // left
    printSpell('major_spiritual', true); // left
    printSpell('minor_spiritual', true); // left
    printSpell('cleric_base', true); // left
    printSpell('wizard_base', true); // left
    printSpell('empath_base', true); // left
    printSpell('sorcerer_base', true); // left
    printSpell('ranger_base', true); // left
    say("'" + B.line(31) + "'");

    //printStat('critical');
    //printStat('AS');
    //printStat('DS');
    say("'" + B.line(31) + "'");
  }
};
