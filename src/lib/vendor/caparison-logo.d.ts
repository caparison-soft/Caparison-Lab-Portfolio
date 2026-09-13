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
  backdrop?: { color?: string; image?: string; draw?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; z?: number } | null;
  exposure?: number;
  maxPixelRatio?: number;
  glass?: MeshPhysicalMaterialParameters;
  darkCore?: string | null;
  darkCoreScale?: number;
};

export type CaparisonLogoHandle = {
  setAutoRotate(v: boolean): void;
  material: MeshPhysicalMaterial;
  dispose(): void;
};

export function mountCaparisonLogo(canvas: HTMLCanvasElement, opts?: CaparisonLogoOptions): CaparisonLogoHandle;
