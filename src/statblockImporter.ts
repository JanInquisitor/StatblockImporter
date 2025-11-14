// @ts-ignore
Hooks.once('ready', () => {
    // @ts-ignore
    if (game.system.id !== 'hyp3e') return;
    // @ts-ignore
    console.log('Game version:', game.version);
});

// @ts-ignore
Hooks.once('init', () => {
    // @ts-ignore
    if (game.system.id !== 'hyp3e') return;
    console.log('Statblock Importer Module initialized');
});


// @ts-ignore
Hooks.on('renderActorDirectory', (app, html, data) => {
    // @ts-ignore
    if (game.system.id !== 'hyp3e') return;

    // Create the button element
    const importButton = $(`
    <button>
        Import Statblock
    </button>
  `);

    // console.log(html);
    html.querySelector('footer.directory-footer').insertAdjacentElement('afterend', importButton[0]);

    importButton.on('click', async (event: Event) => {
        event.preventDefault();
        showImportDialog();
    });
});





function showImportDialog(): void {
    const exampleStatblock = "AUKANECK (3rd-level monk)\n" +
        "AL CG | SZ M (5′ 8″, 160 lbs.) | MV 50 | AC 7 | HD 3 (hp 21)\n" +
        "FA 2 | #A 1/1 (light crossbow [+1]) or 2/1 (empty hand)\n" +
        "D 1d6+1 (light crossbow) or 1d4+1 (empty hand)\n" +
        "SV 15 [transformation +2, avoidance +2, willpower +2] | ML 9 | XP 50\n" +
        "ST 10, DX 13, CN 7, IN 7, WS 10, CH 10\n" +
        "Special: block missile; cellular adjustment\n" +
        "Gear: cæstuses, light crossbow, light bolts ×20";

    // @ts-ignore
    new Dialog({
        title: "Import Hyperborea 3E Statblock",
        content: `
            <form id="hyp3e-import-form">
                <div class="form-group">
                    <label><strong>Actor Type:</strong></label>
                    <select id="actor-type" name="actorType" style="width: 100%; margin-bottom: 1em;">
                        <option value="npc" selected>NPC (Non-Player Character)</option>
                        <option value="character">PC (Player Character)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label><strong>Paste Statblock:</strong></label>
                    <textarea></textarea>
                </div>
                
                <div style="background: #f0f0f0; padding: 0.75em; border-radius: 4px; font-size: 0.85em; margin-top: 0.5em;">
                    <strong>Supported Formats:</strong>
                    <ul style="margin: 0.5em 0; padding-left: 1.5em;">
                        <li><strong>Humanoid NPCs/PCs:</strong> With class levels, attributes (ST, DX, etc.), gear</li>
                        <li><strong>Monsters:</strong> Simplified statblocks with special abilities</li>
                    </ul>
                    <p style="margin: 0.5em 0 0 0; color: #666;">
                        Fields separated by <code>|</code> pipes. Example:<br>
                        <code style="font-size: 0.9em;">AL N | SZ M | MV 40 | AC 7 | HD 1 (hp 7)</code>
                    </p>
                </div>
            </form>
        `,
        buttons: {
            import: {
                icon: '<i class="fas fa-check"></i>',
                label: "Import Actor",
                callback: (html: JQuery) => {
                    const statblockText = html.find('#statblock-input').val() as string;
                    const actorType = html.find('#actor-type').val() as string;

                    if (!statblockText || statblockText.trim().length === 0) {
                        // @ts-ignore
                        ui.notifications.error("Please paste a statblock before importing!");
                        return;
                    }

                    processImport(statblockText, actorType);
                }
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            }
        },
        default: "import",
        render: (html: JQuery) => {
            // Auto-focus the textarea
            html.find('#statblock-input').focus().select();
        }
    }).render(true);
}

// ============================================================================
// IMPORT PROCESSING
// ============================================================================

async function processImport(statblockText: string, actorType: string): Promise<void> {
    // @ts-ignore
    ui.notifications.info("Parsing statblock...");

    const result = parseHyperboreaStatblock(statblockText, actorType);

    if (!result.success || !result.actor) {
        // @ts-ignore
        ui.notifications.error(result.error || "Failed to parse statblock. Check console for details.");
        return;
    }

    try {
        // Create the actor
        // @ts-ignore
        const actor = await Actor.create(result.actor);

        if (actor) {
            // @ts-ignore
            ui.notifications.success(`Successfully imported: ${result.actor.name}`);

            // Open the actor sheet
            // @ts-ignore
            actor.sheet.render(true);
        } else {
            // @ts-ignore
            ui.notifications.error("Failed to create actor in Foundry.");
        }
    } catch (error) {
        console.error("Error creating actor:", error);
        // @ts-ignore
        ui.notifications.error("Error creating actor. Check console for details.");
    }
}

// ============================================================================
// MAIN PARSER
// ============================================================================

function parseHyperboreaStatblock(text: string, actorType: string): ParseResult {
    // Validation
    if (!text || text.trim().length === 0) {
        return {
            success: false,
            error: "Empty statblock provided"
        };
    }

    try {
        const lines = text.trim().split('\n').map(l => l.trim());

        // Detect format type
        const isMonster = detectMonsterFormat(lines);

        if (isMonster) {
            return parseMonsterStatblock(lines, actorType);
        } else {
            return parseHumanoidStatblock(lines, actorType);
        }
    } catch (error) {
        console.error("Parsing error:", error);
        return {
            success: false,
            error: `Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

function detectMonsterFormat(lines: string[]): boolean {
    const firstLine = lines[0];

    // Monsters typically have:
    // 1. ALL CAPS name (or mostly caps)
    // 2. No class level mention like "(3rd-level monk)"
    // 3. Often have #E (Number Encountered) in statline

    const hasClassLevel = firstLine.match(/\(\d+(?:st|nd|rd|th)-level/i);
    const isAllCaps = firstLine === firstLine.toUpperCase();
    const hasNumberEncountered = lines.some(l => l.includes('#E '));

    return (isAllCaps || hasNumberEncountered) && !hasClassLevel;
}

// ============================================================================
// HUMANOID NPC/PC PARSER
// ============================================================================

function parseHumanoidStatblock(lines: string[], actorType: string): ParseResult {
    let narrativeText = '';
    let statLine = '';
    let attributeLine = '';
    let specialLine = '';
    let gearLine = '';

    // Separate lines by type
    for (const line of lines) {
        if (line.includes('AL ') && line.includes('|')) {
            statLine += (statLine ? ' ' : '') + line;
        } else if (line.match(/^ST\s+\d+/)) {
            attributeLine = line;
        } else if (line.startsWith('Special:')) {
            specialLine = line.replace('Special:', '').trim();
        } else if (line.startsWith('Gear:')) {
            gearLine = line.replace('Gear:', '').trim();
        } else if (!statLine && line.length > 0) {
            narrativeText += line + ' ';
        }
    }

    // Validate required fields
    if (!statLine) {
        return {
            success: false,
            error: "Could not find main stat line. Make sure it contains 'AL' and '|' separators."
        };
    }

    // Extract name and class from narrative
    const nameMatch = narrativeText.match(/^([A-ZÀ-ÖØ-öø-ÿ\s''-]+)\s*\(([^)]+)\)/);
    const name = nameMatch ? nameMatch[1].trim() : 'Imported Actor';
    const classInfo = nameMatch ? nameMatch[2] : '';

    // Parse all sections
    const stats = parseHumanoidStatLine(statLine);
    const attributes = parseAttributes(attributeLine);
    const special = parseSpecialAbilities(specialLine);
    const gear = parseGear(gearLine);

    // Validation warnings
    if (!attributes) {
        console.warn("No attributes found in statblock");
    }

    return {
        success: true,
        actor: {
            name,
            type: actorType as 'character' | 'npc',
            isMonster: false,
            img: "icons/svg/mystery-man.svg",
            system: {
                ...stats,
                attributes: attributes || {},
                classInfo,
                biography: narrativeText.trim(),
                special,
                gear
            }
        }
    };
}

function parseHumanoidStatLine(line: string): any {
    const parts = line.split('|').map(p => p.trim());
    const stats: any = {
        damageReduction: 0,
        castingAbility: 0
    };

    for (const part of parts) {
        try {
            if (part.startsWith('AL ')) {
                stats.alignment = part.replace('AL ', '').trim();
            }
            else if (part.startsWith('SZ ')) {
                const sizeMatch = part.match(/SZ\s+(\w+)(?:\s+\(([^)]+)\))?/);
                stats.size = sizeMatch ? sizeMatch[1] : '';
                stats.physicalDescription = sizeMatch?.[2] || '';
            }
            else if (part.startsWith('MV ')) {
                const mv = part.replace('MV ', '').trim();
                stats.movement = parseInt(mv) || mv;
            }
            else if (part.startsWith('AC ')) {
                stats.armorClass = parseInt(part.replace('AC ', ''));
            }
            else if (part.startsWith('DR ')) {
                stats.damageReduction = parseInt(part.replace('DR ', ''));
            }
            else if (part.startsWith('HD ')) {
                const hdMatch = part.match(/HD\s+([\d\+\-]+)(?:\s*\(hp\s+(\d+)\))?/);
                stats.hitDice = hdMatch ? hdMatch[1] : '';
                stats.hitPoints = hdMatch?.[2] ? parseInt(hdMatch[2]) : 0;
            }
            else if (part.startsWith('FA ')) {
                stats.fightingAbility = parseInt(part.replace('FA ', ''));
            }
            else if (part.startsWith('CA ')) {
                stats.castingAbility = parseInt(part.replace('CA ', ''));
            }
            else if (part.startsWith('#A ')) {
                stats.attacks = part.replace('#A ', '').trim();
            }
            else if (part.startsWith('D ')) {
                stats.damage = part.replace('D ', '').trim();
            }
            else if (part.startsWith('SV ')) {
                const svMatch = part.match(/SV\s+(\d+)(?:\s*\[([^\]]+)\])?/);
                stats.savingThrow = svMatch ? parseInt(svMatch[1]) : 0;
                stats.savingThrowMods = svMatch?.[2] || '';
            }
            else if (part.startsWith('ML ')) {
                stats.morale = parseInt(part.replace('ML ', ''));
            }
            else if (part.startsWith('XP ')) {
                stats.experiencePoints = parseInt(part.replace('XP ', '').replace(/,/g, ''));
            }
        } catch (error) {
            console.warn(`Error parsing stat part: ${part}`, error);
        }
    }

    return stats;
}

// ============================================================================
// MONSTER PARSER
// ============================================================================

function parseMonsterStatblock(lines: string[], actorType: string): ParseResult {
    // First line is name and description
    const firstLineParts = lines[0].split(':');
    const name = firstLineParts[0].trim();
    const description = firstLineParts.length > 1 ? firstLineParts.slice(1).join(':').trim() : '';

    let statLine = '';
    let specialLines: string[] = [];
    let inSpecial = false;

    // Parse lines
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if ((line.includes('#E ') || line.includes('AL ')) && line.includes('|')) {
            statLine += (statLine ? ' ' : '') + line;
        } else if (line.startsWith('Special:')) {
            inSpecial = true;
            specialLines.push(line.replace('Special:', '').trim());
        } else if (inSpecial && !line.startsWith('Gear:')) {
            specialLines.push(line);
        }
    }

    if (!statLine) {
        return {
            success: false,
            error: "Could not find monster stat line. Make sure it contains 'AL' or '#E' and '|' separators."
        };
    }

    const stats = parseMonsterStatLine(statLine);
    const special = parseDetailedSpecialAbilities(specialLines.join(' '));

    return {
        success: true,
        actor: {
            name,
            type: 'npc',
            isMonster: true,
            img: "icons/svg/mystery-man.svg",
            system: {
                ...stats,
                description,
                special,
                attributes: null
            }
        }
    };
}

function parseMonsterStatLine(line: string): any {
    const parts = line.split('|').map(p => p.trim());
    const stats: any = {};

    for (const part of parts) {
        try {
            if (part.startsWith('#E ')) {
                stats.numberEncountered = part.replace('#E ', '').trim();
            }
            else if (part.startsWith('AL ')) {
                stats.alignment = part.replace('AL ', '').trim();
            }
            else if (part.startsWith('SZ ')) {
                stats.size = part.replace('SZ ', '').trim();
            }
            else if (part.startsWith('MV ')) {
                stats.movement = part.replace('MV ', '').trim();
            }
            else if (part.startsWith('DX ')) {
                stats.dexterity = parseInt(part.replace('DX ', ''));
            }
            else if (part.startsWith('AC ')) {
                stats.armorClass = parseInt(part.replace('AC ', ''));
            }
            else if (part.startsWith('HD ')) {
                const hdMatch = part.match(/HD\s+([\d\+\-½¼\/]+)(?:\s*\(hp\s+(\d+)\))?/);
                stats.hitDice = hdMatch ? hdMatch[1] : '';
                stats.hitPoints = hdMatch?.[2] ? parseInt(hdMatch[2]) : 0;
            }
            else if (part.startsWith('#A ')) {
                stats.attacks = part.replace('#A ', '').trim();
            }
            else if (part.startsWith('D ')) {
                stats.damage = part.replace('D ', '').trim();
            }
            else if (part.startsWith('SV ')) {
                const svMatch = part.match(/SV\s+(\d+)(?:\s*\[([^\]]+)\])?/);
                stats.savingThrow = svMatch ? parseInt(svMatch[1]) : 0;
                stats.savingThrowMods = svMatch?.[2] || '';
            }
            else if (part.startsWith('ML ')) {
                stats.morale = parseInt(part.replace('ML ', ''));
            }
            else if (part.startsWith('XP ')) {
                stats.experiencePoints = parseInt(part.replace('XP ', '').replace(/,/g, ''));
            }
            else if (part.startsWith('TC ')) {
                stats.treasureClass = part.replace('TC ', '').trim();
            }
        } catch (error) {
            console.warn(`Error parsing monster stat part: ${part}`, error);
        }
    }

    return stats;
}

// ============================================================================
// UTILITY PARSERS
// ============================================================================

function parseAttributes(line: string): any {
    if (!line) return null;

    const attrs: any = {};

    // ST 10, DX 13, CN 7, IN 7, WS 10, CH 10
    const pattern = /(\w+)\s+(\d+)/g;
    let match;

    while ((match = pattern.exec(line)) !== null) {
        const attr = match[1];
        const value = match[2];
        attrs[attr.toLowerCase()] = parseInt(value);
    }

    return Object.keys(attrs).length > 0 ? attrs : null;
}

function parseSpecialAbilities(text: string): string[] {
    if (!text) return [];

    // Split by semicolons or commas
    return text
        .split(/[;,]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function parseDetailedSpecialAbilities(text: string): any[] {
    if (!text) return [];

    const abilities: any[] = [];

    // Match ability names followed by colons
    // e.g., "Bear Hug: description. Resistance: description."
    const abilityPattern = /([A-Z][a-zA-Z\s\-]+?):\s*([^.]+(?:\.[^A-Z:][^.]*)*\.?)/g;
    let match;

    while ((match = abilityPattern.exec(text)) !== null) {
        abilities.push({
            name: match[1].trim(),
            description: match[2].trim()
        });
    }

    // If no structured abilities found, return as single entry
    if (abilities.length === 0 && text.length > 0) {
        if (text.toLowerCase().includes('see ')) {
            abilities.push({
                name: 'Reference',
                description: text
            });
        } else {
            abilities.push({
                name: 'Special',
                description: text
            });
        }
    }

    return abilities;
}

function parseGear(text: string): string[] {
    if (!text) return [];

    // Split by commas
    return text
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

// ============================================================================
// EXPORT (for testing)
// ============================================================================

// @ts-ignore
if (typeof module !== 'undefined') {
    // @ts-ignore
    module.exports = {
        parseHyperboreaStatblock,
        parseHumanoidStatblock,
        parseMonsterStatblock
    };
}