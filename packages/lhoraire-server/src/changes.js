// Every committed write records a row in lhoraire.changes and notifies
// listeners. Inside the write's own transaction, so a rolled-back write
// leaves no change behind, and Postgres only delivers the NOTIFY on
// commit. Live-update streams (and clients resyncing after a reconnect)
// read this feed in id order.
export async function recordChange(client, { projectId = null, issueId = null, kind }) {
  const { rows } = await client.query(
    'INSERT INTO lhoraire.changes (project_id, issue_id, kind) VALUES ($1, $2, $3) RETURNING id',
    [projectId, issueId, kind],
  );
  await client.query("SELECT pg_notify('lhoraire_changes', $1)", [String(rows[0].id)]);
  return rows[0].id;
}
