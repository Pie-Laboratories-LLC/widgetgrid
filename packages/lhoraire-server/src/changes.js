// Every committed write records a row in lhoraire.changes and notifies
// listeners. Inside the write's own transaction, so a rolled-back write
// leaves no change behind, and Postgres only delivers the NOTIFY on
// commit. The payload carries the whole change, so changeHub.js can fan it
// out without querying; the table is what reconnecting clients replay from.
export async function recordChange(client, { projectId = null, issueId = null, kind }) {
  const { rows } = await client.query(
    'INSERT INTO lhoraire.changes (project_id, issue_id, kind) VALUES ($1, $2, $3) RETURNING id',
    [projectId, issueId, kind],
  );
  const payload = JSON.stringify({ seq: Number(rows[0].id), projectId, issueId, kind });
  await client.query("SELECT pg_notify('lhoraire_changes', $1)", [payload]);
  return rows[0].id;
}
