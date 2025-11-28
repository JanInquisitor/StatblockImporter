/**
 * Regex patterns for parsing Hyperborea/OSR stat blocks
 *
 * Format example:
 * NAME (class info)
 * [optional description]
 * AL X | SZ M | MV X | AC X | HD X (hp X) | FA X | #A X | D X | SV X | ML X | XP X
 * ST X, DX X, CN X, IN X, WS X, CH X
 * Special: [abilities]
 * Gear: [equipment]
 */
// ==================== REGEX PATTERNS ====================
const StatBlockPatterns = {
    /**
     * Extract character name and class info
     * Matches: "RAGNARR THE SEA-WOLF (9th-level fighter)"
     * Groups: [1] = name, [2] = class info
     */
    nameAndClass: /^\s*([A-Z][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ\s'-]+?)\s*\(([^)]+)\)/m,
    /**
     * Extract just the name (alternative)
     * Matches: "RAGNARR THE SEA-WOLF"
     */
    nameOnly: /^([A-Z][A-Z\s'-]+?)(?:\s*\(|$)/m,
    /**
     * Extract class level and type
     * Matches: "9th-level fighter" or "2nd-level fighter"
     * Groups: [1] = level number, [2] = level suffix, [3] = class name
     */
    classLevel: /(\d+)(st|nd|rd|th)-level\s+(\w+)/,
    /**
     * Extract optional flavor text/description
     * Matches multi-line description after class info and before the stat line
     */
    description: /\)\s+([^A]+?)(?=\s*AL\s+[A-Z]{1,2}\s*\|)/s,
    // ==================== STAT LINE COMPONENTS ====================
    /**
     * Alignment
     * Matches: "AL CG" or "AL CE" or "AL N"
     */
    alignment: /AL\s+([A-Z]{1,2})/,
    /**
     * Size and dimensions
     * Matches: "SZ M (6′ 4″, 250 lbs.)" or "SZ M"
     */
    size: /SZ\s+([A-Z])\s*(?:\(([^,]+),\s*([^)]+)\))?/,
    /**
     * Movement rate
     * Matches: "MV 40" or "MV 20 (bad knee)"
     */
    movement: /MV\s+(\d+)(?:\s*\(([^)]+)\))?/,
    /**
     * Armor Class (with optional variants)
     * Matches: "AC 3 DR 1" or "AC 9 (8 vs. melee w/quarterstaff)"
     */
    armorClass: /AC\s+(\d+)(?:\s+DR\s+(\d+))?(?:\s*\(([^)]+)\))?/,
    /**
     * Hit Dice and Hit Points
     * Matches: "HD 9 (hp 72)" or "HD 1 (hp 7)"
     */
    hitDice: /HD\s+([0-9¼½¾⅛⅙⅓⅔⅝⅞]+(?:[+-]\d+)?(?:d\d+)?)\b\s*(?:\(hp\s+(\d+)\))?/i,
    /**
     * Fighting Ability (FA)
     */
    fightingAbility: /FA\s+(\d+)/,
    /**
     * Turning Ability (TA) - for clerics
     */
    turningAbility: /TA\s+(\d+)/,
    /**
     * Casting Ability (CA) - for spellcasters
     */
    castingAbility: /CA\s+(\d+)/,
    /**
     * Number of Attacks
     * Matches: "#A 2/1 (battle axe [+6])"
     */
    numAttacks: /#A\s+([\d/]+)\s*\(([^)]+)\)/,
    /**
     * Damage
     * Note: Use negative lookbehind to avoid matching "HD" as "D"
     */
    damage: /(?<!H)D\s+([^|]+?)(?=\s*\||$)/,
    /**
     * Saving Throws
     * Matches: "SV 12 [death +2, transformation +2]"
     */
    savingThrows: /SV\s+(\d+)(?:\s*\[([^\]]+)\])?/,
    /**
     * Morale
     */
    morale: /ML\s+(\d+)/,
    /**
     * Experience Points
     */
    experiencePoints: /XP\s+([\d,]+)/,
    // ==================== ABILITY SCORES ====================
    /**
     * All ability scores in one line
     * Matches: "ST 17, DX 10, CN 15, IN 12, WS 16, CH 18"
     */
    abilityScores: /ST\s+(\d+),\s*DX\s+(\d+),\s*CN\s+(\d+),\s*IN\s+(\d+),\s*WS\s+(\d+),\s*CH\s+(\d+)/,
    strength: /ST\s+(\d+)/,
    dexterity: /DX\s+(\d+)/,
    constitution: /CN\s+(\d+)/,
    intelligence: /IN\s+(\d+)/,
    wisdom: /WS\s+(\d+)/,
    charisma: /CH\s+(\d+)/,
    // ==================== SPECIAL ABILITIES ====================
    /**
     * Special abilities section
     */
    specialAbilities: /Special:\s*([^\n]+?)(?=\n(?:Gear:|$))/s,
    /**
     * Individual special abilities (split by semicolon)
     */
    individualAbility: /([^;]+?)(?:;|$)/g,
    /**
     * Cleric spells
     */
    clericSpells: /cleric spells\s*\(([^)]+)\)/,
    /**
     * Spell level parsing
     */
    spellNames: /([a-z][a-z\s]+?)(?:,|;|×\d+|$)/g,
    // ==================== GEAR ====================
    /**
     * Gear section
     */
    gear: /Gear:\s*([^\n]+)/,
    /**
     * Individual gear items (split by comma)
     */
    gearItems: /([^,]+?)(?:,|$)/g,
    /**
     * Magic item bonus detection
     */
    magicItemBonus: /\+(\d+)\s+(.+)/,
    /**
     * Currency amounts
     */
    currency: /(\d+)\s+(sp|gp|pp|cp)/g,
    /**
     * Item with quantity
     */
    itemWithQuantity: /(.+?)\s*×(\d+)/,
    /**
     * Valued items
     */
    valuedItem: /(.+?)\s*\((\d+)[\s-]*(gp|sp|pp)\s*value\)/,
    // ==================== ATTACK PARSING ====================
    /**
     * Weapon with attack bonus
     */
    weaponWithBonus: /([a-z\s]+?)\s*\[([^\]]+)\]/,
    /**
     * Multiple attack options separated by "or"
     */
    attackOptions: /\s+or\s+/,
    /**
     * Damage expression with weapons
     */
    damageWithWeapon: /([\dd+\-]+)\s*\(([^)]+)\)/g,
    // ==================== UTILITY PATTERNS ====================
    fullStatLine: /AL\s+[A-Z]{1,2}\s*\|.*?XP\s+[\d,]+/,
    statComponents: /\s*\|\s*/,
    multipleNPCs: /^([A-Z][A-Z\s'-]+?)\s*\(×(\d+)\)\s*\(([^)]+)\)/m,
    npcQuantity: /\(×(\d+)\)/,
    zeroLevel: /0th-level\s+(\w+)/,
    // ==================== MONSTER/NON-CLASSED NPC PATTERNS ====================
    monsterName: /(?:^[A-Z\s]+\n)?([A-Z][A-Za-z\s'-]+?)(?:\s*\(([^)]+)\))?\s*:\s*(?:#E|[A-Z])/m,
    numberEncountered: /#E\s+([\dd+×-]+)(?:\s*\(([\dd+×-]+)\))?/,
    monsterDexterity: /DX\s+(\d+)/,
    treasureClass: /TC\s+([A-Z\s,]+|nil)/,
    experiencePointsMonster: /XP\s+([\d,]+)(\*)?/,
    monsterDescription: /:\s+(.+?)(?=\s*#E\s+)/s
};
// ==================== PARSING FUNCTIONS ====================
/**
 * Main parsing function - detects type and routes to appropriate parser
 */
export function parseStatBlock(statBlockText) {
    const isMonster = statBlockText.includes('#E');
    console.log(`Parsing ${isMonster ? 'monster' : 'character'} stat block`);
    if (isMonster) {
        return parseMonsterStatBlock(statBlockText);
    }
    else {
        return parseCharacterStatBlock(statBlockText);
    }
}
/**
 * Parse character (classed NPC) stat block
 */
function parseCharacterStatBlock(statBlockText) {
    const npc = { name: '' };
    const originalText = statBlockText;
    // Extract name and class BEFORE normalization
    const nameMatch = originalText.match(StatBlockPatterns.nameAndClass);
    if (nameMatch) {
        npc.name = nameMatch[1].trim();
        npc.classInfo = nameMatch[2].trim();
        const classMatch = nameMatch[2].match(StatBlockPatterns.classLevel);
        if (classMatch) {
            npc.level = parseInt(classMatch[1]);
            npc.class = classMatch[3];
        }
    }
    else {
        const nameOnlyMatch = originalText.match(StatBlockPatterns.nameOnly);
        if (nameOnlyMatch) {
            npc.name = nameOnlyMatch[1].trim();
        }
    }
    // NORMALIZATION STEP
    statBlockText = statBlockText
        .replace(/[\n\r]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s+|\s+$/, '');
    const descMatch = originalText.match(StatBlockPatterns.description);
    if (descMatch) {
        // npc.description = descMatch[1].trim();
        npc.description = originalText;
    }
    // Extract alignment
    const alMatch = statBlockText.match(StatBlockPatterns.alignment);
    if (alMatch)
        npc.alignment = alMatch[1];
    // Extract size and dimensions
    const sizeMatch = statBlockText.match(StatBlockPatterns.size);
    if (sizeMatch) {
        npc.size = sizeMatch[1];
        npc.height = sizeMatch[2] || null;
        npc.weight = sizeMatch[3] || null;
    }
    // Extract movement
    const mvMatch = statBlockText.match(StatBlockPatterns.movement);
    if (mvMatch) {
        npc.movement = parseInt(mvMatch[1]);
        npc.movementNote = mvMatch[2] || null;
    }
    // Extract AC
    const acMatch = statBlockText.match(StatBlockPatterns.armorClass);
    if (acMatch) {
        npc.ac = parseInt(acMatch[1]);
        npc.dr = acMatch[2] ? parseInt(acMatch[2]) : null;
        npc.acVariant = acMatch[3] || null;
    }
    // Extract HD and HP
    const hdMatch = statBlockText.match(StatBlockPatterns.hitDice);
    if (hdMatch) {
        npc.hitDice = hdMatch[1];
        npc.hitPoints = parseInt(hdMatch[2]);
    }
    // Extract abilities
    const faMatch = statBlockText.match(StatBlockPatterns.fightingAbility);
    if (faMatch)
        npc.fightingAbility = parseInt(faMatch[1]);
    const taMatch = statBlockText.match(StatBlockPatterns.turningAbility);
    if (taMatch)
        npc.turningAbility = parseInt(taMatch[1]);
    const caMatch = statBlockText.match(StatBlockPatterns.castingAbility);
    if (caMatch)
        npc.castingAbility = parseInt(caMatch[1]);
    // Extract attacks
    const attackMatch = statBlockText.match(StatBlockPatterns.numAttacks);
    if (attackMatch) {
        npc.attacksPerRound = attackMatch[1];
        npc.weaponInfo = attackMatch[2];
    }
    // Extract damage
    const damageMatch = statBlockText.match(StatBlockPatterns.damage);
    if (damageMatch) {
        npc.damage = damageMatch[1].trim();
    }
    // Extract saves
    const saveMatch = statBlockText.match(StatBlockPatterns.savingThrows);
    if (saveMatch) {
        npc.baseSave = parseInt(saveMatch[1]);
        npc.saveModifiers = saveMatch[2] || null;
    }
    // Extract morale
    const mlMatch = statBlockText.match(StatBlockPatterns.morale);
    if (mlMatch)
        npc.morale = parseInt(mlMatch[1]);
    // Extract XP
    const xpMatch = statBlockText.match(StatBlockPatterns.experiencePoints);
    if (xpMatch)
        npc.xp = parseInt(xpMatch[1].replace(/,/g, ''));
    // Extract ability scores
    const abilitiesMatch = statBlockText.match(StatBlockPatterns.abilityScores);
    if (abilitiesMatch) {
        npc.abilities = {
            strength: parseInt(abilitiesMatch[1]),
            dexterity: parseInt(abilitiesMatch[2]),
            constitution: parseInt(abilitiesMatch[3]),
            intelligence: parseInt(abilitiesMatch[4]),
            wisdom: parseInt(abilitiesMatch[5]),
            charisma: parseInt(abilitiesMatch[6])
        };
    }
    // Extract special abilities
    const specialMatch = statBlockText.match(StatBlockPatterns.specialAbilities);
    if (specialMatch) {
        npc.special = specialMatch[1].trim();
        npc.specialAbilitiesList = [...specialMatch[1].matchAll(StatBlockPatterns.individualAbility)]
            .map(m => m[1].trim())
            .filter(s => s.length > 0);
        npc.specialAbilitiesParsed = parseSpecialAbilities(npc.specialAbilitiesList);
    }
    // Extract gear
    const gearMatch = statBlockText.match(StatBlockPatterns.gear);
    if (gearMatch) {
        npc.gear = gearMatch[1].trim();
        npc.gearList = [...gearMatch[1].matchAll(StatBlockPatterns.gearItems)]
            .map(m => m[1].trim())
            .filter(s => s.length > 0);
        // npc.wealth = calculateWealth(npc.gearList);
    }
    return npc;
}
/**
 * Parse monster (non-classed NPC) stat block
 */
export function parseMonsterStatBlock(statBlockText) {
    const monster = { name: '', type: 'monster' };
    const originalText = statBlockText;
    // Extract monster name BEFORE normalization
    const statLineMatch = originalText.match(/^(.+?):\s*#E/m);
    if (statLineMatch) {
        const nameLine = statLineMatch[1].trim();
        const nameWithType = nameLine.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
        if (nameWithType) {
            monster.name = nameWithType[1].trim();
            monster.subtype = nameWithType[2].trim();
        }
        else {
            monster.name = nameLine.trim();
            monster.subtype = null;
        }
    }
    // NORMALIZATION STEP
    statBlockText = statBlockText
        .replace(/[\n\r]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s+|\s+$/, '');
    // Extract description if present
    const description = statBlockText;
    monster.description = description;
    // Extract number encountered
    const neMatch = statBlockText.match(StatBlockPatterns.numberEncountered);
    if (neMatch) {
        monster.numberEncountered = neMatch[1];
        monster.numberInLair = neMatch[2] || null;
    }
    // Extract alignment
    const alMatch = statBlockText.match(StatBlockPatterns.alignment);
    if (alMatch)
        monster.alignment = alMatch[1];
    // Extract size
    const sizeMatch = statBlockText.match(StatBlockPatterns.size);
    if (sizeMatch) {
        monster.size = sizeMatch[1];
        monster.height = sizeMatch[2] || null;
        monster.weight = sizeMatch[3] || null;
    }
    // Extract movement
    const mvMatch = statBlockText.match(StatBlockPatterns.movement);
    if (mvMatch) {
        monster.movement = parseInt(mvMatch[1]);
        monster.movementNote = mvMatch[2] || null;
    }
    // Extract Dexterity
    const dxMatch = statBlockText.match(StatBlockPatterns.monsterDexterity);
    if (dxMatch)
        monster.dexterity = parseInt(dxMatch[1]);
    // Extract AC
    const acMatch = statBlockText.match(StatBlockPatterns.armorClass);
    if (acMatch) {
        monster.ac = parseInt(acMatch[1]);
        monster.dr = acMatch[2] ? parseInt(acMatch[2]) : null;
        monster.acVariant = acMatch[3] || null;
    }
    // Extract HD and HP
    const hdMatch = statBlockText.match(StatBlockPatterns.hitDice);
    if (hdMatch) {
        monster.hitDice = hdMatch[1].trim(); // e.g., "6+6", "¼", "11+2"
        monster.hitPoints = hdMatch[2] ? parseInt(hdMatch[2]) : 0; // HP if present, else 0
    }
    // Extract attacks
    const attackMatch = statBlockText.match(StatBlockPatterns.numAttacks);
    if (attackMatch) {
        monster.atkRate = attackMatch[1];
        monster.weaponInfo = attackMatch[2];
    }
    // Extract damage
    const damageMatch = statBlockText.match(StatBlockPatterns.damage);
    if (damageMatch) {
        monster.damage = damageMatch[1].trim();
    }
    // Extract saves
    const saveMatch = statBlockText.match(StatBlockPatterns.savingThrows);
    if (saveMatch) {
        monster.baseSave = parseInt(saveMatch[1]);
        monster.saveModifiers = saveMatch[2] || null;
    }
    // Extract morale
    const mlMatch = statBlockText.match(StatBlockPatterns.morale);
    if (mlMatch)
        monster.morale = parseInt(mlMatch[1]);
    // Extract XP
    const xpMatch = statBlockText.match(StatBlockPatterns.experiencePointsMonster);
    if (xpMatch) {
        monster.xp = parseInt(xpMatch[1].replace(/,/g, ''));
        monster.xpSpecial = xpMatch[2] === '*';
    }
    // Extract Treasure Class
    const tcMatch = statBlockText.match(StatBlockPatterns.treasureClass);
    if (tcMatch) {
        monster.treasureClass = tcMatch[1].trim();
    }
    // Extract special abilities
    const specialMatch = statBlockText.match(StatBlockPatterns.specialAbilities);
    if (specialMatch) {
        monster.special = specialMatch[1].trim();
        monster.specialAbilitiesList = [...specialMatch[1].matchAll(StatBlockPatterns.individualAbility)]
            .map(m => m[1].trim())
            .filter(s => s.length > 0);
        monster.specialAbilitiesParsed = parseSpecialAbilities(monster.specialAbilitiesList);
    }
    return monster;
}
// ==================== HELPER FUNCTIONS ====================
/**
 * Parse special abilities into structured objects
 */
export function parseSpecialAbilities(abilitiesList) {
    const parsed = [];
    for (const abilityString of abilitiesList) {
        const match = abilityString.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
        if (match) {
            const ability = {
                name: match[1].trim(),
                details: match[2] ? match[2].trim() : null
            };
            // Heroic fighting
            if (ability.name.toLowerCase().includes('heroic fighting')) {
                const multiplierMatch = ability.details?.match(/×(\d+)/);
                const hdMatch = ability.details?.match(/(\d+)\s*HD/);
                if (multiplierMatch)
                    ability.attackMultiplier = parseInt(multiplierMatch[1]);
                if (hdMatch)
                    ability.targetHD = parseInt(hdMatch[1]);
            }
            // Weapon mastery
            if (ability.name.toLowerCase().includes('mastery')) {
                ability.type = ability.name.toLowerCase().includes('grand') ? 'grand mastery' : 'weapon mastery';
                ability.weapon = ability.details || undefined;
            }
            // Turn undead
            if (ability.name.toLowerCase().includes('turn undead')) {
                ability.type = 'turn undead';
            }
            // Scroll use/writing
            if (ability.name.toLowerCase().includes('scroll')) {
                ability.type = ability.name.toLowerCase().includes('writing') ? 'scroll writing' : 'scroll use';
            }
            // Spellcasting
            if (ability.name.toLowerCase().includes('spells')) {
                ability.type = 'spellcasting';
                if (ability.details) {
                    ability.spells = parseSpellList(ability.details);
                }
            }
            // New weapon skill
            if (ability.name.toLowerCase().includes('new weapon skill')) {
                ability.type = 'weapon skill';
                ability.weapon = ability.details || undefined;
            }
            parsed.push(ability);
        }
    }
    return parsed;
}
/**
 * Parse spell list from special abilities
 */
export function parseSpellList(spellText) {
    const spellsByLevel = [];
    const levels = spellText.split(';').map(s => s.trim());
    for (const levelText of levels) {
        const spells = [];
        const spellMatches = levelText.matchAll(/([a-z][a-z\s]+?)(?:\s*×(\d+))?(?:,|$)/g);
        for (const match of spellMatches) {
            const spellName = match[1].trim();
            const quantity = match[2] ? parseInt(match[2]) : 1;
            if (spellName.length > 0) {
                spells.push({ name: spellName, quantity });
            }
        }
        if (spells.length > 0) {
            spellsByLevel.push(spells);
        }
    }
    return spellsByLevel;
}
/**
 * Calculate total wealth from gear list
 */
export function calculateWealth(gearList) {
    const wealth = {
        copper: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        electrum: 0,
        totalGoldValue: 0,
        valuedItems: []
    };
    const toGold = {
        cp: 0.01,
        sp: 0.1,
        ep: 0.5,
        gp: 1,
        pp: 5
    };
    for (const item of gearList) {
        const currencyMatch = item.match(/^(\d+)\s+(cp|sp|ep|gp|pp)$/i);
        if (currencyMatch) {
            const amount = parseInt(currencyMatch[1]);
            const type = currencyMatch[2].toLowerCase();
            switch (type) {
                case 'cp':
                    wealth.copper += amount;
                    break;
                case 'sp':
                    wealth.silver += amount;
                    break;
                case 'ep':
                    wealth.electrum += amount;
                    break;
                case 'gp':
                    wealth.gold += amount;
                    break;
                case 'pp':
                    wealth.platinum += amount;
                    break;
            }
        }
        const valuedItemMatch = item.match(/(.+?)\s*\((\d+)[\s-]*(gp|sp|pp|cp)\s*value\)/i);
        if (valuedItemMatch) {
            const itemName = valuedItemMatch[1].trim();
            const value = parseInt(valuedItemMatch[2]);
            const currency = valuedItemMatch[3].toLowerCase();
            wealth.valuedItems.push({
                name: itemName,
                value: value,
                currency: currency,
                goldValue: value * toGold[currency]
            });
        }
    }
    wealth.totalGoldValue =
        (wealth.copper * toGold.cp) +
            (wealth.silver * toGold.sp) +
            (wealth.electrum * toGold.ep) +
            (wealth.gold * toGold.gp) +
            (wealth.platinum * toGold.pp) +
            wealth.valuedItems.reduce((sum, item) => sum + item.goldValue, 0);
    wealth.totalGoldValue = Math.round(wealth.totalGoldValue * 100) / 100;
    return wealth;
}
