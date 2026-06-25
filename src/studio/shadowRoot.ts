import { createContext, useContext } from 'react';

/**
 * The DOM tree the Studio is rendered into.
 *
 * In production the panel lives inside Home Assistant's shadow DOM and mounts
 * itself into its OWN shadow root (see src/mount.tsx). Components that inject or
 * resolve styles at runtime — most notably CodeMirror — must target this root
 * instead of the global `document`; otherwise their styles land in
 * `document.head` and never cross the shadow boundary to reach the editor.
 *
 * Defaults to `document` so the context is harmless when rendered standalone.
 */
export const RenderRootContext = createContext<ShadowRoot | Document>(document);

export const useRenderRoot = (): ShadowRoot | Document =>
  useContext(RenderRootContext);
