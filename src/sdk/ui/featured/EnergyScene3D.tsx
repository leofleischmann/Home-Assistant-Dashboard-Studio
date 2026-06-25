import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import {
  Clock,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { useDarkMode, useEntity } from '../../hass/hooks';
import { useTheme } from '../../hass/theme';
import type { HassEntity } from '../../hass/types';
import { entityDisplayName, num, power } from '../../format';

const CANVAS_HEIGHT = 220;

function intensityFromEntity(entity: HassEntity | undefined): number {
  if (!entity) return 0.3;
  const v = Number.parseFloat(entity.state);
  if (Number.isNaN(v) || v < 0) return 0.15;

  const dc = entity.attributes.device_class as string | undefined;
  if (dc === 'power') return Math.min(1, Math.max(0.06, v / 4500));
  const unit = String(entity.attributes.unit_of_measurement ?? '').toLowerCase();
  if (unit === 'w' || unit === 'kw') {
    const watts = unit === 'kw' ? v * 1000 : v;
    return Math.min(1, Math.max(0.06, watts / 4500));
  }
  return Math.min(1, Math.max(0.1, v / 100));
}

function formatReading(entity: HassEntity | undefined): string {
  if (!entity) return '—';
  const v = Number.parseFloat(entity.state);
  if (Number.isNaN(v)) return entity.state;
  if (entity.attributes.device_class === 'power') return power(v);
  const unit = entity.attributes.unit_of_measurement as string | undefined;
  return unit ? `${num(v, 1)} ${unit}` : num(v, 1);
}

type SceneState = {
  intensity: number;
  dark: boolean;
  primary: string;
};

function wireOrb(
  radius: number,
  detail: number,
  color: number,
  opacity: number,
): { mesh: LineSegments; geo: IcosahedronGeometry; edges: EdgesGeometry; mat: LineBasicMaterial } {
  const geo = new IcosahedronGeometry(radius, detail);
  const edges = new EdgesGeometry(geo);
  const mat = new LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new LineSegments(edges, mat);
  return { mesh, geo, edges, mat };
}

/**
 * Wireframe energy orb — pulsing icosahedron driven by a power sensor.
 */
export function EnergyScene3D({ entityId }: { entityId: string }) {
  const entity = useEntity(entityId);
  const dark = useDarkMode();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SceneState>({ intensity: 0.3, dark: false, primary: '#4f7cff' });

  const intensity = useMemo(() => intensityFromEntity(entity), [entity]);
  const label = entityDisplayName(entity, entityId);

  useEffect(() => {
    stateRef.current = { intensity, dark, primary: theme.primary };
  }, [intensity, dark, theme.primary]);

  useEffect(() => {
    console.log('[Debug EnergyScene3D]:', { entityId, state: entity?.state, intensity });
  }, [entityId, entity?.state, intensity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 1);
    const scene = new Scene();

    const camera = new PerspectiveCamera(40, width / CANVAS_HEIGHT, 0.1, 20);
    camera.position.set(0, 0.1, 2.4);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, CANVAS_HEIGHT);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const accent = new Color(stateRef.current.primary);
    const outer = wireOrb(0.72, 3, accent.getHex(), 0.88);
    const mid = wireOrb(0.52, 2, accent.getHex(), 0.45);
    const core = wireOrb(0.28, 1, accent.getHex(), 0.7);

    const orbGroup = new Group();
    orbGroup.add(outer.mesh, mid.mesh, core.mesh);
    scene.add(orbGroup);

    const clock = new Clock();
    let raf = 0;
    let disposed = false;
    const tint = new Color();

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const { intensity: i, primary } = stateRef.current;

      tint.set(primary);
      const pulseHz = 0.85 + i * 1.6;
      const pulse = Math.sin(elapsed * pulseHz * Math.PI * 2);
      const scale = 1 + pulse * (0.035 + i * 0.07);

      orbGroup.scale.setScalar(scale);
      orbGroup.rotation.y = elapsed * 0.22;
      orbGroup.rotation.x = elapsed * 0.11;
      mid.mesh.rotation.y = -elapsed * 0.35;
      core.mesh.rotation.z = elapsed * 0.4;

      const baseOpacity = 0.55 + i * 0.35;
      outer.mat.color.copy(tint);
      outer.mat.opacity = baseOpacity + pulse * 0.12;
      mid.mat.color.copy(tint);
      mid.mat.opacity = 0.28 + i * 0.2 + pulse * 0.08;
      core.mat.color.copy(tint);
      core.mat.opacity = 0.5 + i * 0.35 + pulse * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = Math.max(container.clientWidth, 1);
      camera.aspect = w / CANVAS_HEIGHT;
      camera.updateProjectionMatrix();
      renderer.setSize(w, CANVAS_HEIGHT);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    console.log('[Debug EnergyScene3D]: wireframe orb initialized');

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.remove();
      for (const layer of [outer, mid, core]) {
        layer.geo.dispose();
        layer.edges.dispose();
        layer.mat.dispose();
      }
      renderer.dispose();
    };
  }, [entityId]);

  const style = {
    '--es3d-accent': theme.primary,
    '--es3d-pulse': String(0.35 + intensity * 0.65),
  } as CSSProperties;

  return (
    <div className={`rd-energy3d${dark ? ' rd-energy3d--dark' : ''}`} style={style}>
      <div ref={containerRef} className="rd-energy3d__canvas" aria-hidden />
      <div className="rd-energy3d__footer">
        <strong>{formatReading(entity)}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}
