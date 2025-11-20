# Hyperborea Statblock Importer

[![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-v12%2B-blue)](https://foundryvtt.com)
[![Hyperborea 3E](https://img.shields.io/badge/System-Hyperborea%203E-green)](https://foundryvtt.com/packages/hyp3e)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Copy any monster/NPC statblock written in the official Hyperborea 3E format → instantly get a ready-to-use Actor in Foundry VTT.**

Perfect for quickly importing the hundreds of monsters and NPCs from your own notes, homebrew, or legally purchased PDFs (you paste the text yourself).

---

### Current Features (v1.0.0)

- One-click import of **monsters and classed NPCs**
- Correctly parses and maps:
    - Name, alignment, size, movement
    - AC (including descending, DR, and notes)
    - HD, HP, fighting ability (FA)
    - Number of attacks, damage, attack bonuses
    - Saving throws (base + individual modifiers)
    - Ability scores (ST, DX, CN, IN, WS, CH)
    - Morale, XP, special abilities, gear list
- Creates a properly structured `npc` or `character` Actor that works immediately with the Hyperborea 3E system

**Important:** Player-character import is not yet supported (planned for a future version). Right now the module is focused on **monsters NPCs only**.

---

### Installation

#### Recommended: Install from Manifest URL

1. In Foundry VTT go to **Add-on Modules → Install Module**
2. Paste this URL:
   https://raw.githubusercontent.com/JanInquisitor/StatblockImporter/main/module.json
3. Click **Install**

#### Manual install

Download the latest release ZIP from https://github.com/JanInquisitor/StatblockImporter/releases and install it the usual way.

---

### How to Use

1. Open the **Actors** directory
2. Click the new **“Import Statblock”** button that appears in the header
3. Select **NPC** (monsters) or **PC** (classed NPCs) – both create the correct actor type
4. Paste your statblock text
5. Click **Import Actor**

The actor appears instantly, fully populated and ready to drag onto the scene.

---

### Compatibility

- Foundry VTT **v12+** (verified on v13)
- No copyrighted material is included – you supply the statblock text yourself

---
