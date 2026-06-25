import { hassStore } from '../hass/store';
import { DEFAULT_PROJECT, type Project } from './project';

// Persisted per-user inside Home Assistant via the frontend user-data store.
// No Python, no files — survives reloads and is tied to your HA login.
const KEY = 'homeassistant_dashboard_studio';
const LEGACY_KEY = 'react_dashboard_code';

interface StoredV1 {
  code?: string; // legacy single-file shape
  files?: Record<string, string>;
  entry?: string;
}

function parseStored(value: StoredV1 | null | undefined): Project | null {
  if (value?.files && value.entry && Object.keys(value.files).length > 0) {
    return { files: value.files, entry: value.entry };
  }
  if (typeof value?.code === 'string') {
    return { entry: 'dashboard.tsx', files: { 'dashboard.tsx': value.code } };
  }
  return null;
}

export async function loadProject(): Promise<Project> {
  const connection = hassStore.getHass()?.connection;
  if (!connection) return DEFAULT_PROJECT;
  try {
    const res = await connection.sendMessagePromise<{ value: StoredV1 | null }>({
      type: 'frontend/get_user_data',
      key: KEY,
    });
    const project = parseStored(res?.value);
    if (project) return project;

    const legacy = await connection.sendMessagePromise<{ value: StoredV1 | null }>({
      type: 'frontend/get_user_data',
      key: LEGACY_KEY,
    });
    return parseStored(legacy?.value) ?? DEFAULT_PROJECT;
  } catch {
    return DEFAULT_PROJECT;
  }
}

export async function saveProject(project: Project): Promise<void> {
  const connection = hassStore.getHass()?.connection;
  if (!connection) {
    throw new Error('Keine Verbindung zu Home Assistant.');
  }
  await connection.sendMessagePromise({
    type: 'frontend/set_user_data',
    key: KEY,
    value: { files: project.files, entry: project.entry },
  });
}
