/**
 * Maps parsed stat block data to Foundry VTT Actor data structure for Hyperborea system
 * @param parsedData The output from parseStatBlock()
 * @returns Foundry VTT-compatible actor data object
 */
export function mapToFoundryActor(parsedData) {
    // Determine if this is a monster or character
    if ('type' in parsedData && parsedData.type === 'monster') {
        return mapMonsterToFoundry(parsedData);
    }
    else {
        return mapCharacterToFoundry(parsedData);
    }
}
/**
 * Map a character NPC to Foundry Actor data
 */
function mapCharacterToFoundry(npc) {
    const actorData = {
        name: npc.name || "Imported Character",
        type: "character", // "npc" only for monsters
        img: "icons/svg/mystery-man.svg",
        system: {
            biography: npc.description || "",
            details: {
                alignment: npc.alignment?.toUpperCase() || "N",
                level: {
                    value: npc.level ?? 1
                },
                class: npc.class || "Fighter",
                race: "",
                xp: {
                    value: npc.xp ?? 0,
                    bonus: 0,
                    primeAttr: "",
                    toNextLvl: 0
                }
            },
            attributes: {
                str: { value: npc.abilities?.strength ?? 10, mod: 0, save: 0, proficient: false },
                dex: { value: npc.abilities?.strength ?? 10, mod: 0, save: 0, proficient: false },
                con: { value: npc.abilities?.strength ?? 10, mod: 0, save: 0, proficient: false },
                int: { value: npc.abilities?.strength ?? 10, mod: 0, save: 0, proficient: false },
                wis: { value: npc.abilities?.strength ?? 10, mod: 0, save: 0, proficient: false },
                cha: { value: npc.abilities?.strength ?? 10, mod: 0, save: 0, proficient: false }
            },
            hp: {
                value: npc.hitPoints ?? 8,
                max: npc.hitPoints ?? 8,
                temp: 0,
                tempmax: 0
            },
            ac: {
                value: npc.ac ?? 10,
                dr: npc.dr ?? 0,
                notes: npc.acVariant ?? ""
            },
            movement: {
                base: { value: npc.movement ?? 30 },
                exploration: { value: npc.movement ?? 30 },
                tempMvMod: 0,
                travel: { value: 24 }
            },
            otherMv: { value: '' },
            proficiencies: { class: "", lvl4: "", lvl8: "", lvl12: "" },
            initiative: { bonus: 0 },
            fa: 0,
            ca: 0,
            ta: 0,
            save: 15,
            morale: npc.morale ?? 8,
            attacks: {
                value: "1",
                note: ""
            },
            saves: {
                death: { value: 10 },
                transformation: { value: 8 },
                device: { value: 8 },
                avoidance: { value: 8 },
                sorcery: { value: 8 },
            },
            money: { cp: { value: 0 }, ep: { value: 0 }, gp: { value: 0 }, pp: { value: 0 }, sp: { value: 0 } },
            treasure: "",
            special: "",
            gear: "",
            size: "M",
            height: "",
            weight: "",
            notes: { value: "", public: "" }
        },
        // ── OWNERSHIP & FLAGS ─────────────────────────────────
        // ownership: {
        //     default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
        //     [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
        // },
    };
    return actorData;
}
/**
 * Map a monster to Foundry Actor data
 */
export function mapMonsterToFoundry(npc) {
    const actorData = {
        name: npc.name || "Imported Character",
        type: "npc", // "npc" only for monsters
        img: "icons/svg/mystery-man.svg",
        system: {
            biography: npc.description || "",
            details: {
                alignment: npc.alignment?.toUpperCase() || "N",
                level: {
                    value: npc.level ?? 1
                },
                class: npc.class || "Fighter",
                race: ""
            },
            hd: npc.hitDice = "d" + npc.hitDice || "1d8",
            dx: npc.abilities?.dexterity ?? 10,
            hp: {
                min: npc.hitPoints ?? 8,
                max: npc.hitPoints ?? 0,
                temp: 0,
                tempmax: 0
            },
            ac: {
                value: npc.ac ?? 10,
                dr: npc.dr ?? 0,
                notes: npc.acVariant ?? ""
            },
            movement: {
                base: { value: npc.movement ?? 30 },
                exploration: { value: npc.movement ?? 30 },
                tempMvMod: 0,
                travel: { value: 24 }
            },
            otherMv: { value: '' },
            proficiencies: { class: "", lvl4: "", lvl8: "", lvl12: "" },
            initiative: { bonus: 0 },
            fa: npc.hitDice ?? "1",
            ca: 0,
            ta: 0,
            save: 15,
            morale: npc.morale ?? 8,
            encLair: npc.numberInLair ?? "",
            encWild: npc.numberEncountered ?? "",
            atkRate: npc.atkRate ?? "1",
            saves: {
                death: { value: npc.baseSave ?? 10 },
                transformation: { value: npc.baseSave ?? 10 },
                device: { value: npc.baseSave ?? 10 },
                avoidance: { value: npc.baseSave ?? 10 },
                sorcery: { value: npc.baseSave ?? 10 },
            },
            money: { cp: { value: 0 }, ep: { value: 0 }, gp: { value: 0 }, pp: { value: 0 }, sp: { value: 0 } },
            treasure: npc.treasureClass ?? "",
            xp: npc.xp ?? 0,
            special: "",
            gear: "",
            size: npc.size ?? "M",
            height: "",
            weight: "",
            notes: { value: "", public: "" }
        },
        // ── OWNERSHIP & FLAGS ─────────────────────────────────
        // ownership: {
        //     default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
        //     [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
        // },
    };
    return actorData;
}
/**
 * Calculate ability score modifier (standard D&D formula)
 */
function calculateModifier(score) {
    return Math.floor((score - 10) / 2);
}
/**
 * Extract specific save modifier from the save modifiers string
 * Example: "death +2, transformation +2, poison +1" -> extractSaveModifier(str, "death") returns 2
 */
function extractSaveModifier(modifiersString, saveType) {
    if (!modifiersString)
        return 0;
    const regex = new RegExp(`${saveType}\\s*([+-]\\d+)`, 'i');
    const match = modifiersString.match(regex);
    if (match && match[1]) {
        return parseInt(match[1]);
    }
    return 0;
}
/**
 * Create weapon items from parsed attack data
 */
export function createWeaponItems(npc) {
    const weapons = [];
    if (!npc.damage)
        return weapons;
    // Split damage by "or" to get individual weapon damages
    const damageOptions = npc.damage.split(/\s+or\s+/);
    const weaponOptions = npc.weaponInfo ? npc.weaponInfo.split(/\s+or\s+/) : [];
    for (let i = 0; i < damageOptions.length; i++) {
        const damageText = damageOptions[i];
        const weaponText = weaponOptions[i] || "";
        // Extract damage formula and weapon name
        const damageMatch = damageText.match(/([\dd+\-]+)\s*\(([^)]+)\)/);
        if (damageMatch) {
            const damageFormula = damageMatch[1];
            const weaponName = damageMatch[2];
            // Extract attack bonus from weapon info
            const bonusMatch = weaponText.match(/\[([^\]]+)\]/);
            const attackBonus = bonusMatch ? bonusMatch[1] : "+0";
            const weapon = {
                name: weaponName || `Weapon ${i + 1}`,
                type: "weapon",
                img: "icons/weapons/swords/sword-broad-worn.webp",
                system: {
                    description: "",
                    damage: {
                        formula: damageFormula,
                        type: "physical"
                    },
                    attack: {
                        bonus: attackBonus
                    },
                    equipped: true,
                    quantity: 1,
                    weight: 0
                }
            };
            weapons.push(weapon);
        }
    }
    return weapons;
}
/**
 * Create gear items from parsed gear list
 */
export function createGearItems(npc) {
    const items = [];
    if (!npc.gearList)
        return items;
    for (const gearItem of npc.gearList) {
        // Skip currency items
        if (gearItem.match(/^\d+\s+(cp|sp|ep|gp|pp)$/i))
            continue;
        // Check if it's a magic item (starts with +)
        const magicMatch = gearItem.match(/^\+(\d+)\s+(.+)/);
        // Check for quantity
        const quantityMatch = gearItem.match(/(.+?)\s*×(\d+)/);
        let itemName = gearItem;
        let quantity = 1;
        let bonus = 0;
        if (magicMatch) {
            bonus = parseInt(magicMatch[1]);
            itemName = magicMatch[2];
        }
        if (quantityMatch) {
            itemName = quantityMatch[1];
            quantity = parseInt(quantityMatch[2]);
        }
        // Determine item type
        let itemType = "equipment";
        let img = "icons/svg/item-bag.svg";
        if (itemName.toLowerCase().includes("armor") ||
            itemName.toLowerCase().includes("mail") ||
            itemName.toLowerCase().includes("shield")) {
            itemType = "armor";
            img = "icons/equipment/chest/breastplate-layered-steel.webp";
        }
        else if (itemName.toLowerCase().includes("potion")) {
            itemType = "consumable";
            img = "icons/consumables/potions/potion-bottle-corked-labeled-red.webp";
        }
        else if (itemName.toLowerCase().includes("scroll")) {
            itemType = "consumable";
            img = "icons/sundries/scrolls/scroll-bound-brown.webp";
        }
        else if (itemName.toLowerCase().includes("sword") ||
            itemName.toLowerCase().includes("axe") ||
            itemName.toLowerCase().includes("spear") ||
            itemName.toLowerCase().includes("bow") ||
            itemName.toLowerCase().includes("mace")) {
            itemType = "weapon";
            img = "icons/weapons/swords/sword-broad-worn.webp";
        }
        const item = {
            name: itemName.trim(),
            type: itemType,
            img: img,
            system: {
                description: "",
                quantity: quantity,
                weight: 0,
                equipped: false,
                bonus: bonus > 0 ? bonus : undefined
            }
        };
        items.push(item);
    }
    return items;
}
/**
 * Main function to create a complete Foundry Actor with items
 */
export async function createFoundryActor(parsedData) {
    // Map the basic actor data
    const actorData = mapToFoundryActor(parsedData);
    // Create the actor
    // @ts-ignore
    const actor = await Actor.implementation.create(actorData);
    if (!actor) {
        throw new Error("Failed to create actor");
    }
    // Add weapons if it's a character
    if ('damage' in parsedData && parsedData.damage) {
        const weapons = createWeaponItems(parsedData);
        if (weapons.length > 0) {
            await actor.createEmbeddedDocuments("Item", weapons);
        }
    }
    // Add gear if it's a character
    if ('gearList' in parsedData && parsedData.gearList) {
        const gear = createGearItems(parsedData);
        if (gear.length > 0) {
            await actor.createEmbeddedDocuments("Item", gear);
        }
    }
    return actor;
}
/**
 * Batch import multiple NPCs
 */
export async function batchImportActors(parsedDataArray) {
    const actors = [];
    for (const parsedData of parsedDataArray) {
        try {
            const actor = await createFoundryActor(parsedData);
            actors.push(actor);
            console.log(`Successfully imported: ${parsedData.name}`);
        }
        catch (error) {
            console.error(`Failed to import ${parsedData.name}:`, error);
        }
    }
    return actors;
}
