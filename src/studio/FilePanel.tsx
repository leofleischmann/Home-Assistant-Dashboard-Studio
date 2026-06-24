import { newFileTemplate } from './project';

function normalize(input: string): string {
  let p = input.trim().replace(/^\/+/, '');
  if (!/\.(tsx?|jsx?)$/.test(p)) p += '.tsx';
  return p;
}

export function FilePanel({
  files,
  entry,
  activePath,
  onSelect,
  onChangeFiles,
  onSetEntry,
}: {
  files: Record<string, string>;
  entry: string;
  activePath: string;
  onSelect: (path: string) => void;
  onChangeFiles: (files: Record<string, string>, nextActive?: string) => void;
  onSetEntry: (path: string) => void;
}) {
  const paths = Object.keys(files).sort();

  const addFile = () => {
    const input = window.prompt('Neue Datei (z. B. components/Card.tsx):');
    if (!input) return;
    const path = normalize(input);
    if (files[path]) {
      window.alert(`"${path}" gibt es schon.`);
      return;
    }
    onChangeFiles({ ...files, [path]: newFileTemplate(path) }, path);
  };

  const renameFile = (oldPath: string) => {
    const input = window.prompt('Datei umbenennen:', oldPath);
    if (!input) return;
    const path = normalize(input);
    if (path === oldPath) return;
    if (files[path]) {
      window.alert(`"${path}" gibt es schon.`);
      return;
    }
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(files)) next[k === oldPath ? path : k] = v;
    onChangeFiles(next, activePath === oldPath ? path : activePath);
    if (entry === oldPath) onSetEntry(path);
  };

  const deleteFile = (path: string) => {
    if (Object.keys(files).length <= 1) {
      window.alert('Die letzte Datei kann nicht gelöscht werden.');
      return;
    }
    if (path === entry) {
      window.alert('Die Einstiegsdatei kann nicht gelöscht werden. Lege zuerst eine andere als Start fest.');
      return;
    }
    if (!window.confirm(`"${path}" löschen?`)) return;
    const next = { ...files };
    delete next[path];
    const nextActive = activePath === path ? Object.keys(next).sort()[0] : activePath;
    onChangeFiles(next, nextActive);
  };

  return (
    <div className="rd-files">
      <div className="rd-files__head">
        <span>Dateien</span>
        <button className="rd-files__add" title="Neue Datei" onClick={addFile}>
          ＋
        </button>
      </div>
      <ul className="rd-files__list">
        {paths.map((path) => (
          <li
            key={path}
            className={`rd-files__item ${path === activePath ? 'is-active' : ''}`}
            onClick={() => onSelect(path)}
          >
            <span className="rd-files__name" title={path}>
              {path}
            </span>
            <span className="rd-files__actions">
              <button
                className={`rd-files__entry ${path === entry ? 'is-entry' : ''}`}
                title={path === entry ? 'Einstiegsdatei' : 'Als Einstieg festlegen'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetEntry(path);
                }}
              >
                ⌂
              </button>
              <button
                className="rd-files__icon"
                title="Umbenennen"
                onClick={(e) => {
                  e.stopPropagation();
                  renameFile(path);
                }}
              >
                ✎
              </button>
              <button
                className="rd-files__icon"
                title="Löschen"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(path);
                }}
              >
                ✕
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
