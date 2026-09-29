import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from "three";

import type { Rgb01 } from "../../../shared/lib";

const GLYPH_PX = 160;
const PAD_PX = 28;

const cssRgb = ([r, g, b]: Rgb01) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  return texture;
}

export interface FragmentTexture {
  texture: CanvasTexture;
  aspect: number;
}

export function fragmentTexture(
  text: string,
  color: Rgb01,
  fontFamily: string,
  blur: number,
): FragmentTexture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const font = `400 ${GLYPH_PX}px ${fontFamily}`;
  const pad = PAD_PX + blur * 3;
  if (ctx) ctx.font = font;
  const width = Math.ceil((ctx?.measureText(text).width ?? GLYPH_PX * text.length * 0.6) + pad * 2);
  canvas.width = width;
  canvas.height = GLYPH_PX + pad * 2;
  if (ctx) {
    ctx.font = font;
    ctx.fillStyle = cssRgb(color);
    ctx.textBaseline = "middle";
    ctx.filter = blur > 0 ? `blur(${blur}px)` : "none";
    ctx.fillText(text, pad, canvas.height / 2 + GLYPH_PX * 0.04);
  }
  return { texture: canvasTexture(canvas), aspect: canvas.width / canvas.height };
}

export function cornersTexture(aspect: number, armRatio: number, color: Rgb01): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round(1024 / aspect);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const { width: w, height: h } = canvas;
    const arm = armRatio * w;
    const inset = 6;
    ctx.strokeStyle = cssRgb(color);
    ctx.lineWidth = 5;
    ctx.lineCap = "square";
    const corners: ReadonlyArray<readonly [number, number, number, number]> = [
      [inset, inset, 1, 1],
      [w - inset, inset, -1, 1],
      [inset, h - inset, 1, -1],
      [w - inset, h - inset, -1, -1],
    ];
    ctx.beginPath();
    for (const [x, y, dx, dy] of corners) {
      ctx.moveTo(x + dx * arm, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * arm);
    }
    ctx.stroke();
  }
  return canvasTexture(canvas);
}
