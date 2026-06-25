import { forwardRef } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { entityAutocomplete } from './entityCompletion';
import { useRenderRoot } from './shadowRoot';

export const Editor = forwardRef<
  ReactCodeMirrorRef,
  { value: string; onChange: (next: string) => void }
>(function Editor({ value, onChange }, ref) {
  // We're mounted inside the panel's shadow root; tell CodeMirror so it injects
  // its styles there (not document.head, which can't reach us) and resolves the
  // selection against the right tree.
  const root = useRenderRoot();
  return (
    <CodeMirror
      ref={ref}
      root={root}
      value={value}
      onChange={onChange}
      height="100%"
      theme="dark"
      extensions={[
        javascript({ jsx: true, typescript: true }),
        entityAutocomplete,
      ]}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        indentOnInput: true,
      }}
      style={{ height: '100%', fontSize: 13 }}
    />
  );
});
