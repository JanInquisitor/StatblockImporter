// ============================================================================
// HYPERBOREA 3E STATBLOCK IMPORTER
// Improved version with DCC best practices
// ============================================================================

interface ParsedActor {
    name: string;
    type: 'character' | 'npc';
    isMonster: boolean;
    img?: string;
    system: any;
}

interface ParseResult {
    success: boolean;
    actor?: ParsedActor;
    error?: string;
}
