
console.log('Happy developing ✨')

let statBlock = "AL N | SZ M | MV 40 | DX 9 | AC 7 | HD 1 (hp 7)   \n" +
    "FA 0 | #A 1/1 (short spear) | D 1d8 | SV 17 | ML 8 | XP 10"

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

    const btn = " <button type='button'>Import Statblock</button> "

    console.log(html);
    html.querySelector('footer.directory-footer').insertAdjacentElement('afterend', importButton[0]);
    console.log(html.querySelector('footer.directory-footer'));
    console.log("Hello here!");

    // @ts-ignore
    importButton.on('click', async (event) => {
        event.preventDefault();
        // Your importer code here, e.g., open a FilePicker or custom dialog
        // Example: Dialog.prompt({ title: 'Import Statblock', content: 'Upload your file...' });
        // Or call a custom function like await MyImporterModule.importStatblock();
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
// Hooks.once('ready', () => {
//     // @ts-ignore
//     const actors = (game as any).actors;
//     console.log('Actors:', actors);
// });


function analyzeHTML(html: JQuery<HTMLElement>) {
    console.log('=== HTML OBJECT DUMP ===');
    console.log('html:', html);
    console.log('typeof html:', typeof html);
    console.log('html instanceof HTMLElement:', html instanceof HTMLElement);
    console.log('html instanceof $:', html instanceof $);

    // Todas las propiedades y métodos
    console.log('--- PROPIEDADES ---');
    // Object.getOwnPropertyNames(html).forEach(p => console.log(p, typeof html[p]));

    console.log('--- MÉTODOS PROTOTIPO ---');
    let proto = Object.getPrototypeOf(html);
    // while (proto && proto !== Object.prototype) {
    //     Object.getOwnPropertyNames(proto).forEach(m => {
    //         if (typeof html[m] === 'function') {
    //             console.log(m + '()');
    //         }
    //     });
    //     proto = Object.getPrototypeOf(proto);
    // }

    // console.log('--- MÉTODOS DE jQuery INYECTADOS ---');
    // ['find', 'on', 'before', 'after', 'append', 'prepend', 'html', 'text'].forEach(m => {
    //     console.log(m + ':', typeof html[m]);
    // });
}
