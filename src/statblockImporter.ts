const statBlockExample = "AL N | SZ M | MV 40 | DX 9 | AC 7 | HD 1 (hp 7)   \n" +
    "FA 0 | #A 1/1 (short spear) | D 1d8 | SV 17 | ML 8 | XP 10";

// @ts-ignore
Hooks.once('init', () => {
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

    // @ts-ignore
    importButton.on('click', async (event) => {
        event.preventDefault();
        // Your importer code here, e.g., open a FilePicker or custom dialog
        // Example: Dialog.prompt({ title: 'Import Statblock', content: 'Upload your file...' });
        // Or call a custom function like await MyImporterModule.importStatblock();

        // @ts-ignore
        new Dialog({
            title: "Import Hyperborea Statblock",
            content: `
                <form>
                    <div class="form-group">
                        <label>Paste Statblock:</label>
                        <textarea id="statblock-input" name="statblock" rows="10" style="width: 100%; font-family: monospace;">
                        ${statBlockExample}</textarea>
                    </div>
                    <p style="font-size: 0.9em; color: #666;">
                        Paste a Hyperborea 3E statblock in the format:<br>
                        <code style="font-size: 0.85em;">AL N | SZ M | MV 40 | DX 9 | AC 7 | HD 1 (hp 7) | FA 0 | #A 1/1 | D 1d8 | SV 17 | ML 8 | XP 10</code>
                    </p>
                </form>
            `,
            buttons: {
                import: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Import",
                    // @ts-ignore
                    callback: (html) => {
                        // @ts-ignore
                        const statblockText = html.find('#statblock-input').val();
                        console.log("Statblock to import:", statblockText);

                        // Call your parsing function here
                        // parseAndCreateActor(statblockText);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel"
                }
            },
            default: "import"
        }).render(true);
    });
});


// Or just use @ts-ignore for specific lines
// @ts-ignore
Hooks.once('ready', () => {
    // @ts-ignore
    console.log('Game version:', game.version);
});

// Access game globals (use any assertions if needed)
// @ts-ignore
Hooks.once('ready', () => {
    // @ts-ignore
    const actors = (game as any).actors;
    console.log('Actors:', actors);
});

