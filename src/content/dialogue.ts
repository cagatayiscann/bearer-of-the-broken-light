/**
 * Entity encounter dialogue (DATA ONLY — Layer A intros).
 * Keyed by dialogueId on Entity records.
 */
export const entityDialogue: Record<string, string> = {
  'grizz-intro':
    'Hah! Words, yes? Grizz knows words. Find them quick — the wood grows impatient, and so do I. Share the loot after, yes?',
  'wisp-intro':
    'I drift between the roots where letters sleep. Speak the hidden words, traveler, and the mist will part for you.',
};

export function getEntityDialogue(dialogueId: string | undefined): string | undefined {
  if (!dialogueId) return undefined;
  return entityDialogue[dialogueId];
}
