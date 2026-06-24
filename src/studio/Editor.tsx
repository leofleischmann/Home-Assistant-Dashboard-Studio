import { forwardRef } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { entityAutocomplete } from './entityCompletion';

export const Editor = forwardRef<
  ReactCodeMirrorRef,
  { value: string; onChange: (next: string) => void }
>(function Editor({ value, onChange }, ref) {
  return (
    <CodeMirror
      ref={ref}
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
