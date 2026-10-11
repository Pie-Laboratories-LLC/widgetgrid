import { invalid, notFound, alreadyExists, withTransaction } from '../grpc.js';
import { recordChange } from '../changes.js';

const KEY_PATTERN = /^[a-z][a-z0-9]{1,9}$/;
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function toProtoProject(row) {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    color: row.color,
    createdAt: row.created_at.toISOString(),
    modifiedAt: row.modified_at.toISOString(),
  };
}

function checkNameAndColor(name, color) {
  if (!name.trim()) throw invalid('Give the project a name.');
  if (color && !COLOR_PATTERN.test(color)) throw invalid('Colour must look like #4a6fa5.');
}

export function createProjectHandlers({ pool }) {
  return {
    async ListProjects() {
      const { rows } = await pool.query('SELECT * FROM lhoraire.projects ORDER BY lower(name)');
      return { projects: rows.map(toProtoProject) };
    },

    async GetProject({ key }) {
      const { rows } = await pool.query('SELECT * FROM lhoraire.projects WHERE key = $1', [key.toLowerCase()]);
      if (!rows[0]) throw notFound(`No project "${key}".`);
      return { project: toProtoProject(rows[0]) };
    },

    async CreateProject({ key, name, color }, caller) {
      const normalizedKey = key.trim().toLowerCase();
      if (!KEY_PATTERN.test(normalizedKey)) {
        throw invalid('Project key: 2-10 lowercase letters or digits, starting with a letter (like ffdb).');
      }
      checkNameAndColor(name, color);
      return withTransaction(pool, async (client) => {
        const existing = await client.query('SELECT 1 FROM lhoraire.projects WHERE key = $1', [normalizedKey]);
        if (existing.rows[0]) throw alreadyExists(`A project with key "${normalizedKey}" already exists.`);
        const { rows } = await client.query(
          `INSERT INTO lhoraire.projects (key, name, color, created_by)
           VALUES ($1, $2, COALESCE(NULLIF($3, ''), '#4a6fa5'), $4) RETURNING *`,
          [normalizedKey, name.trim(), color, caller.userId],
        );
        await recordChange(client, { projectId: rows[0].id, kind: 'project_created' });
        return { project: toProtoProject(rows[0]) };
      });
    },

    async UpdateProject({ id, name, color }) {
      checkNameAndColor(name, color);
      return withTransaction(pool, async (client) => {
        const { rows } = await client.query(
          `UPDATE lhoraire.projects SET name = $2, color = COALESCE(NULLIF($3, ''), color), modified_at = now()
           WHERE id = $1 RETURNING *`,
          [id, name.trim(), color],
        );
        if (!rows[0]) throw notFound('That project no longer exists.');
        await recordChange(client, { projectId: id, kind: 'project_updated' });
        return { project: toProtoProject(rows[0]) };
      });
    },

    async DeleteProject({ id }) {
      return withTransaction(pool, async (client) => {
        const { rowCount } = await client.query('DELETE FROM lhoraire.projects WHERE id = $1', [id]);
        if (!rowCount) throw notFound('That project no longer exists.');
        await recordChange(client, { projectId: id, kind: 'project_deleted' });
        return {};
      });
    },
  };
}
