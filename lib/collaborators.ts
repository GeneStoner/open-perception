// ── Allowed GitHub usernames ───────────────────────────────────────────────
// Add a collaborator by adding their GitHub username to this list.
// Usernames are case-insensitive.

export const ALLOWED_COLLABORATORS = [
  'GeneStoner',       // G. Stoner
  // 'hulusi-kafaligonul',  // H. Kafaligonul — add when GitHub username confirmed
];

export function isAllowed(username: string): boolean {
  return ALLOWED_COLLABORATORS
    .map(u => u.toLowerCase())
    .includes(username.toLowerCase());
}
