// // @ts-ignore
// importButton.on('click', async (event) => {
//     event.preventDefault();
//     // Your importer code here, e.g., open a FilePicker or custom dialog
//     // Example: Dialog.prompt({ title: 'Import Statblock', content: 'Upload your file...' });
//     // Or call a custom function like await MyImporterModule.importStatblock();
//
//     // @ts-ignore
//     // Create the dialog
//     new Dialog({
//         title: "Import Hyperborea Statblock",
//         content: `
//                 <form>
//                     <div class="form-group">
//                         <label>Actor Type:</label>
//                         <select id="actor-type" name="actorType" style="width: 100%; margin-bottom: 1em;">
//                             <option value="npc">NPC</option>
//                             <option value="character">PC (Player Character)</option>
//                         </select>
//                     </div>
//                     <div class="form-group">
//                         <label>Paste Statblock:</label>
//                         <textarea id="statblock-input" name="statblock" rows="10" style="width: 100%; font-family: monospace;"></textarea>
//                     </div>
//                     <p style="font-size: 0.9em; color: #666;">
//                         Paste a Hyperborea 3E statblock in the format:<br>
//                         <code style="font-size: 0.85em;">AL N | SZ M | MV 40 | DX 9 | AC 7 | HD 1 (hp 7) | FA 0 | #A 1/1 | D 1d8 | SV 17 | ML 8 | XP 10</code>
//                     </p>
//                 </form>
//             `,
//         buttons: {
//             import: {
//                 icon: '<i class="fas fa-check"></i>',
//                 label: "Import",
//                 // @ts-ignore
//                 callback: (html) => {
//                     // @ts-ignore
//                     const statblockText = html.find('#statblock-input').val();
//                     // @ts-ignore
//                     const actorType = html.find('#actor-type').val();
//
//                     console.log("Actor Type:", actorType);
//                     console.log("Statblock to import:", statblockText);
//
//                     // Call your parsing function here
//                     // parseAndCreateActor(statblockText, actorType);
//                 }
//             },
//             cancel: {
//                 icon: '<i class="fas fa-times"></i>',
//                 label: "Cancel"
//             }
//         },
//         default: "import"
//     }).render(true);
// });