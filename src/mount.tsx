import { createRoot, type Root } from 'react-dom/client';
import Studio from './studio/Studio';
import { RenderRootContext } from './studio/shadowRoot';
import appCss from './styles.css?inline';
import studioCss from './studio/studio.css?inline';

// All styles for the panel chrome AND the rendered dashboard, in one string.
// Injected into each panel's shadow root — NOT document.head: Home Assistant
// mounts custom panels inside its own shadow DOM, so document-level styles never
// reach us. `:host` makes the (otherwise inline) custom element fill its slot.
const CSS = `:host { display: block; height: 100%; }\n${appCss}\n${studioCss}`;

/**
 * Render the Studio into `host`'s shadow root, fully style-isolated from HA.
 * Idempotent: re-mounting (HA navigates away and back) resets the root cleanly.
 * Returns the React root so the caller can unmount it.
 */
export function mountStudio(host: HTMLElement): Root {
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = CSS;
  const container = document.createElement('div');
  shadow.replaceChildren(style, container);

  const root = createRoot(container);
  root.render(
    <RenderRootContext.Provider value={shadow}>
      <Studio />
    </RenderRootContext.Provider>,
  );
  return root;
}
