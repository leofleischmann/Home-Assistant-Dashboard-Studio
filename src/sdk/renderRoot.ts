import { createContext, useContext } from 'react';

/**
 * DOM root the panel renders into (shadow root in HA / dev, document in tests).
 * Used by CodeMirror and chart tooltips so injected UI escapes local containing blocks.
 */
export const RenderRootContext = createContext<ShadowRoot | Document>(document);

export function useRenderRoot(): ShadowRoot | Document {
  return useContext(RenderRootContext);
}

/** Stable ids for shadow-root mount targets (see mount.tsx). */
export const PANEL_ROOT_ID = 'rd-panel-root';
export const OVERLAY_ROOT_ID = 'rd-overlay-root';

/** Mount container inside the panel shadow root — safe portal target for overlays. */
export function chartTooltipPortalTarget(root: ShadowRoot | Document): Element | null {
  if (root instanceof ShadowRoot) {
    const overlay = root.getElementById(OVERLAY_ROOT_ID);
    if (overlay) return overlay;
    const panel = root.getElementById(PANEL_ROOT_ID);
    if (panel) return panel;
    // Legacy: style is first child, React mounts in the next element.
    return root.lastElementChild;
  }
  return document.body;
}
