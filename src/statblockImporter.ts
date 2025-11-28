import {CharacterNPC, parseStatBlock} from "./parser.js";
import {mapMonsterToFoundry, mapToFoundryActor} from "./mapper.js";


// Foundry Hooks

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
    <button class="statblock-import-button" style="min-width: 180px;">
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
                        return;
                    }
                    let npc: CharacterNPC = parseStatBlock(statblockText);
                    let actorData = mapToFoundryActor(npc);
                    try {
                        // @ts-ignore
                        const created = Actor.create(actorData);
                        if (created) {
                            console.log(created);
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
        resizable: true,
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