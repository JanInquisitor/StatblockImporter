
console.log('Happy developing ✨')

// @ts-ignore
Hooks.once('init', () => {
    console.log('Statblock Importer Module initialized');
});

// Access game globals (use any assertions if needed)
// @ts-ignore
Hooks.once('ready', () => {
    // @ts-ignore
    const actors = (game as any).actors;
    console.log('Actors:', actors);
});

// Or just use @ts-ignore for specific lines
// @ts-ignore
Hooks.once('ready', () => {
    // @ts-ignore
    console.log('Game version:', game.version);
});