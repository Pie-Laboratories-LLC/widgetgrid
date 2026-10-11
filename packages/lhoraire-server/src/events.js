// Appends to an issue's history (lhoraire.issue_events). Values are stored
// as JSON, so anything serializable works: a field's old/new value, a
// comment id, a link description.
export async function addEvent(client, { issueId, actorId, kind, field = null, oldValue = null, newValue = null }) {
  await client.query(
    `INSERT INTO lhoraire.issue_events (issue_id, actor_id, kind, field, old_value, new_value)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [issueId, actorId, kind, field, JSON.stringify(oldValue), JSON.stringify(newValue)],
  );
}
