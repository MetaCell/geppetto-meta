import * as THREE from "three";
import {
  DataUniformShader,
  DataVertexShader,
  DataFragmentShader,
  LutHelper,
  SegmentationLutHelper,
} from "ami.js";
import { LayerState, LayerTransform } from "../types";

export interface LayerMaterialOpts {
  opacity?: number;
  lut?: string; // LUT name for continuous overlays, e.g. 'hot_and_cold'
  windowCenter?: number;
  windowWidth?: number;
  interpolation?: 0 | 1; // 0=nearest (labels), 1=trilinear (default)
  segmentation?: object; // preset data from SegmentationPreset — signals label map mode
  backgroundRemoval?: boolean | { threshold?: number };
}

/*
 * Builds the air-alpha opacity LUT curve that makes background voxels
 * transparent while keeping tissue fully opaque at any normal opacity value.
 * Called on first creation and again whenever opacity changes for continuous layers.
 */
export function buildAirAlphaLut(
  lut: any, // LutHelper
  opacity: number,
  threshold = 0.2,
): void {
  // Below threshold: air is visible only when slider is pushed past 0.8
  const airAlpha = Math.max(0, (opacity - 0.8) / 0.2);
  lut.lutsO = {
    ...LutHelper.presetLutsO(),
    "bg-remove": [
      [0, airAlpha],
      [threshold, airAlpha],
      [threshold + 1e-4, 1],
      [1, 1],
    ],
  };
  lut.lutO = "bg-remove";
}

/*
 * Applies a rigid transform (translate/rotate/scale) to a layer by composing
 * the overlay's base lps2IJK with the inverse of the transform matrix and
 * writing the result into uWorldToData. This enables runtime co-registration
 * nudging without reloading the volume.
 */
export function applyLayerTransform(
  uniforms: Record<string, { value: any }>,
  baseLps2IJK: THREE.Matrix4,
  t: LayerTransform,
): void {
  const [tx, ty, tz] = t.translate ?? [0, 0, 0];
  const [rxDeg, ryDeg, rzDeg] = t.rotate ?? [0, 0, 0];
  const [sx, sy, sz] = t.scale ?? [1, 1, 1];
  const D2R = Math.PI / 180;

  /*
   * Compose: T * R * S * T0 (rotate/scale around volume centre, then translate)
   * For simplicity we compute the transform relative to origin; callers who
   * need centre-anchored rotation should pre-translate before calling.
   */
  const T = new THREE.Matrix4().makeTranslation(tx, ty, tz);
  const R = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(rxDeg * D2R, ryDeg * D2R, rzDeg * D2R),
  );
  const S = new THREE.Matrix4().makeScale(sx, sy, sz);
  const M = new THREE.Matrix4().multiplyMatrices(T, R).multiply(S);
  const Minv = M.clone().invert();

  uniforms.uWorldToData.value = baseLps2IJK.clone().multiply(Minv);
}

/*
 * Pure factory: creates a GPU material + uniforms for one overlay volume.
 * Returns a LayerState without an id or renderOrder — the caller assigns those.
 */
export function createLayerMaterial(
  stack: any,
  opts: LayerMaterialOpts = {},
): Omit<LayerState, "id" | "renderOrder"> {
  const {
    opacity = 1,
    lut: lutName = "hot_and_cold",
    windowCenter,
    windowWidth,
    interpolation = 1,
    segmentation,
    backgroundRemoval,
  } = opts;

  // Build DataTextures from packed stack data.
  const textures: THREE.DataTexture[] = [];
  for (let m = 0; m < stack._rawData.length; m++) {
    const tex = new THREE.DataTexture(
      stack._rawData[m],
      stack.textureSize,
      stack.textureSize,
      stack.textureType,
      THREE.UnsignedByteType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter,
    );
    tex.needsUpdate = true;
    tex.flipY = false;
    textures.push(tex);
  }

  const uniforms = DataUniformShader.uniforms();
  uniforms.uTextureSize.value = stack.textureSize;
  uniforms.uTextureContainer.value = textures;
  uniforms.uWorldToData.value = stack.lps2IJK;
  uniforms.uNumberOfChannels.value = stack.numberOfChannels;
  uniforms.uPixelType.value = stack.pixelType;
  uniforms.uPackedPerPixel.value = stack.packedPerPixel;
  uniforms.uBitsAllocated.value = stack.bitsAllocated;

  /*
   * ami.js's data shader expects non-negative intensities and shifts volumes with
   * a negative minimum (e.g. CT in Hounsfield units, which go below 0) up by this
   * offset when packing textures. Window/level and threshold uniforms are compared
   * against those shifted values, so they must be offset the same way or they'll
   * be wrong for any volume with negative intensities.
   */
  const amiOffset = stack.minMax[0] < 0 ? -stack.minMax[0] : 0;
  uniforms.uWindowCenterWidth.value = [
    amiOffset + (windowCenter ?? stack.windowCenter),
    windowWidth ?? stack.windowWidth,
  ];
  uniforms.uRescaleSlopeIntercept.value = [stack.rescaleSlope, stack.rescaleIntercept];
  uniforms.uDataDimensions.value = [
    stack.dimensionsIJK.x,
    stack.dimensionsIJK.y,
    stack.dimensionsIJK.z,
  ];
  uniforms.uInterpolation.value = interpolation;
  uniforms.uLowerUpperThreshold.value = [amiOffset + stack.minMax[0], amiOffset + stack.minMax[1]];
  uniforms.uOpacity.value = opacity;

  /*
   * Single source of truth for the amiOffset math — used by both the
   * backgroundRemoval and default setWindowLevel closures below so the
   * offset can't drift out of sync.
   */
  const applyWindowLevel = (center: number, width: number) => {
    uniforms.uWindowCenterWidth.value = [amiOffset + center, width];
  };

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: new DataVertexShader().compute(),
    fragmentShader: new DataFragmentShader(uniforms).compute(),
    transparent: true,
    depthWrite: false,
  });

  const baseLps2IJK = stack.lps2IJK.clone();
  let helperLut: any = null;
  let helperSegLut: any = null;

  if (segmentation) {
    /*
     * Segmentation (label map): LUT is keyed by integer label.
     * Background label 0 has alpha 0 in standard presets — always transparent.
     */
    helperSegLut = new SegmentationLutHelper(document.createElement("div"), segmentation);
    uniforms.uLutSegmentation.value = 1;
    uniforms.uTextureLUTSegmentation.value = helperSegLut.texture;
  } else {
    // Continuous overlay: 1-D color + opacity LUT keyed by normalized intensity.
    helperLut = new LutHelper(document.createElement("div"));
    helperLut.luts = LutHelper.presetLuts();
    helperLut.lut = lutName;
    uniforms.uLut.value = 1;

    if (backgroundRemoval) {
      const threshold =
        typeof backgroundRemoval === "object" ? (backgroundRemoval.threshold ?? 0.2) : 0.2;
      buildAirAlphaLut(helperLut, opacity, threshold);
      uniforms.uTextureLUT.value = helperLut.texture;
      // setOpacity rebuilds the air-alpha curve so air stays transparent
      const setOpacity = (v: number) => {
        buildAirAlphaLut(helperLut, v, threshold);
        uniforms.uTextureLUT.value = helperLut.texture;
        uniforms.uOpacity.value = v;
      };
      const setWindowLevel = applyWindowLevel;
      const setLut = (name: string) => {
        helperLut.lut = name;
        uniforms.uTextureLUT.value = helperLut.texture;
      };
      const setTransform = (t: LayerTransform) => applyLayerTransform(uniforms, baseLps2IJK, t);

      return {
        material,
        uniforms,
        lut: helperLut,
        baseLps2IJK,
        setOpacity,
        setWindowLevel,
        setLut,
        setTransform,
      };
    } else {
      uniforms.uTextureLUT.value = helperLut.texture;
    }
  }

  /*
   * Default setOpacity — plain uniform write (segmentation layers, or
   * continuous without backgroundRemoval)
   */
  const setOpacity = (v: number) => {
    uniforms.uOpacity.value = v;
  };
  const setWindowLevel = segmentation ? undefined : applyWindowLevel;
  const setLut =
    helperLut && !segmentation
      ? (name: string) => {
          helperLut.lut = name;
          uniforms.uTextureLUT.value = helperLut.texture;
        }
      : undefined;
  const setTransform = (t: LayerTransform) => applyLayerTransform(uniforms, baseLps2IJK, t);

  return {
    material,
    uniforms,
    lut: helperLut ?? undefined,
    segLut: helperSegLut ?? undefined,
    baseLps2IJK,
    setOpacity,
    setWindowLevel,
    setLut,
    setTransform,
  };
}
