import {CharacterNPC, parseCharacterStatBlock, parseStatBlock} from "./parser.js";
import {mapMonsterToFoundry, mapToFoundryActor} from "./mapper.js";


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
    // console.log('Statblock Importer Module initialized');
    console.log("%c HYPERBOREA STATBLOCK IMPORTER LOADED ", "background: #722; color: white; font-size: 16px");
});


// @ts-ignore
Hooks.on('renderActorDirectory', (app, html, data) => {
    // @ts-ignore
    if (game.system.id !== 'hyp3e') return;

    html.querySelector('.statblock-import-button')?.remove();

    // Create the button element
    const importButton = $(`
    <button class="statblock-import-button">
        Import Statblock
    </button>
  `);

    // console.log(html);
    html.querySelector('footer.directory-footer').insertAdjacentElement('afterend', importButton[0]);

    importButton.on('click', async (event: Event) => {
        event.preventDefault();
        await showImportDialog();
    });
    // importButton.remove();
});


async function showImportDialog(): Promise<void> {
    // @ts-ignore
    new Dialog({
        title: "Import Statblock",
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
                    <textarea class="statblock-text-area"></textarea>
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

                    const statblockText = html.find('.statblock-text-area').val() as string;

                    if (!statblockText || statblockText.trim().length === 0) {
                        // @ts-ignore
                        ui.notifications.error("Please paste a statblock before importing!");
                        return;
                    }

                    let npc: CharacterNPC = parseStatBlock(statblockText);

                    let actorData = mapMonsterToFoundry(npc);

                    try {
                        // @ts-ignore
                        const created = Actor.create(actorData);
                        if (created) {
                            // @ts-ignore
                            ui.notifications.info(`Imported: ${created.name}`);
                        } else {    // @ts-ignore

                            ui.notifications.error("Creation failed.");
                        }
                    } catch (error) {
                        // @ts-ignore

                        ui.notifications.error(`Import error: ${error.message}`);
                        console.error(error, actorData);
                    }
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

// @ts-ignore
if (typeof module !== 'undefined') {
    // @ts-ignore
    module.exports = {};
}