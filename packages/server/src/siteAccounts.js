// The site's own accounts, from configuration rather than code (the
// addresses are personal and the repo isn't the place for them).
//
// OWNER_EMAIL: comma-separated -- every address listed gets role 'owner'
// on sign-in.
//
// ASSIGNED_USERNAMES: comma-separated name=email pairs, e.g.
// "pielabs=webmaster@pie-laboratories.com". The name is that address's
// automatically, once it has proved it owns the address (the emailed code
// at registration, or Identity Center), and nobody else may take it --
// even a name the reserved list in accountService.js doesn't cover.

// Whether a sign-in's email is proved to be theirs, from its ID token
// claims. The owner role and assigned or reserved usernames go by email,
// and with social sign-in (2026-10) the email is whatever the provider
// says: Microsoft's is unchecked, so anyone could claim an address there.
// Site-registered accounts proved theirs with the emailed code, and
// Google/LinkedIn say email_verified; Identity Center doesn't send the
// claim, but only ever holds staff the owner added.
export function emailIsVerified(claims) {
  if (String(claims['cognito:username'] ?? '').startsWith('IdentityCenter_')) return true;
  return claims.email_verified === true || claims.email_verified === 'true';
}

export function parseEmailList(value = '') {
  return String(value).split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function parseAssignedUsernames(value = '') {
  const byName = new Map(); // lowercased name -> { username, email }
  const byEmail = new Map(); // email -> username
  for (const pair of String(value).split(',')) {
    const [rawName, rawEmail] = pair.split('=').map((s) => s?.trim() ?? '');
    if (!rawName || !rawEmail) continue;
    const email = rawEmail.toLowerCase();
    byName.set(rawName.toLowerCase(), { username: rawName, email });
    byEmail.set(email, rawName);
  }
  return {
    // The name this address gets, or null.
    forEmail: (email) => byEmail.get(String(email ?? '').trim().toLowerCase()) ?? null,
    // The address a name belongs to, or null if it isn't assigned.
    ownerOf: (username) => byName.get(String(username ?? '').toLowerCase())?.email ?? null,
  };
}

export const NO_ASSIGNED_USERNAMES = parseAssignedUsernames('');
