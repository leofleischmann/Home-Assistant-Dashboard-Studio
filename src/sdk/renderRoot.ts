import { createContext, useContext } from 'react';

/**
 * DOM root the panel renders into (shadow root in HA / dev, document in tests).
 * Used by CodeMirror and chart tooltips so injected UI escapes local containing blocks.
 */
export const RenderRootContext = createContext<ShadowRoot | Document>(document);

export function useRenderRoot(): ShadowRoot | Document {
  return useContext(RenderRootContext);
}

/** Mount container inside the panel shadow root — safe portal target for overlays. */
export function chartTooltipPortalTarget(root: ShadowRoot | Document): Element | null {
  if (root instanceof ShadowRoot) {
    return root.firstElementChild;
  }
  return document.body;
}
