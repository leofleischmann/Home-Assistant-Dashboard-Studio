import { createRoot } from 'react-dom/client';
import {
  callService as hassCallService,
  createConnection,
  createLongLivedTokenAuth,
  getAuth,
  subscribeEntities,
  type Connection,
  type HassEntities,
  type HassServiceTarget,
} from 'home-assistant-js-websocket';
import { hassStore } from './hass/store';
import type { AppHass } from './hass/types';
import Studio from './studio/Studio';

const hassUrl = import.meta.env.VITE_HASS_URL;
const token = import.meta.env.VITE_HASS_TOKEN;

// Connect to the real Home Assistant instance over WebSocket, then feed the
// same store the production panel uses — so App.tsx behaves identically.
async function connect(): Promise<void> {
  const auth = token
    ? createLongLivedTokenAuth(hassUrl, token)
    : await getAuth({ hassUrl });

  const connection: Connection = await createConnection({ auth });

  const callService: AppHass['callService'] = (
    domain,
    service,
    serviceData,
    target,
  ) =>
    hassCallService(
      connection,
      domain,
      service,
      serviceData,
      target as HassServiceTarget | undefined,
    );

  subscribeEntities(connection, (entities: HassEntities) => {
    const hass: AppHass = {
      states: entities as unknown as AppHass['states'],
      callService,
      connection,
    };
    hassStore.setHass(hass);
  });
}

const mount = document.getElementById('app');
if (mount) {
  createRoot(mount).render(<Studio />);
}

connect().catch((err) => {
  console.error(
    '[react-dashboard-studio] Verbindung zu Home Assistant fehlgeschlagen.\n' +
      'Prüfe VITE_HASS_URL und VITE_HASS_TOKEN in .env.local.',
    err,
  );
});
