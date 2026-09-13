/** Types for the vendored 3D logo module (vanilla/caparison-logo.js from caparison-logo-3d.zip). */
import type { MeshPhysicalMaterial, MeshPhysicalMaterialParameters } from "three";

export type CaparisonLogoOptions = {
  src?: string;
  transparent?: boolean;
  autoRotate?: boolean;
  rotateSpeed?: number;
  drag?: boolean;
  pointerParallax?: boolean;
  scrollTilt?: boolean;
  fit?: number;
  offset?: [number, number];
  depthScale?: number;
  swing?: number | null;
  envPreset?: "strips" | "wide";
  /** Base colour of the environment map (what the glass reflects between the lights). Match the page ground so the glass blends. */
  envBase?: string | null;
  backdrop?: { color?: string; image?: string; draw?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; z?: number; size?: [number, number]; live?: boolean } | null;
  exposure?: number;
  /** "aces" (filmic) or "none" (1:1; keeps a dark backdrop's tone through the glass). */
  toneMapping?: "aces" | "none";
  maxPixelRatio?: number;
  glass?: MeshPhysicalMaterialParameters;
  darkCore?: string | null;
  darkCoreScale?: number;
};

export type CaparisonLogoHandle = {
  setAutoRotate(v: boolean): void;
  repaintBackdrop(): void;
  material: MeshPhysicalMaterial;
  dispose(): void;
};

export function mountCaparisonLogo(canvas: HTMLCanvasElement, opts?: CaparisonLogoOptions): CaparisonLogoHandle;
