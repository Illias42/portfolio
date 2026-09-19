import {
  Color,
  DoubleSide,
  LinearFilter,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
  type Texture,
  type Vector3,
  type Vector4,
  type WebGLRenderer,
} from "three";

import { causticsFragment, causticsVertex } from "./pool-shaders";

const black = new Color(0x000000);
const previousClear = new Color();

// Differential-area caustics: a refracted grid is rasterised onto the floor, density = brightness.
export class CausticsPass {
  private readonly target: WebGLRenderTarget;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material: ShaderMaterial;
  private readonly mesh: Mesh;

  constructor(
    private readonly gl: WebGLRenderer,
    size: number,
    grid: number,
    light: Vector3,
    ball: Vector4,
  ) {
    this.target = new WebGLRenderTarget(size, size, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.material = new ShaderMaterial({
      vertexShader: causticsVertex,
      fragmentShader: causticsFragment,
      uniforms: { light: { value: light }, water: { value: null }, uBall: { value: ball } },
      blending: NoBlending,
      side: DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(new PlaneGeometry(2, 2, grid, grid), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  get texture(): Texture {
    return this.target.texture;
  }

  update(water: Texture) {
    if (this.material.uniforms.water) this.material.uniforms.water.value = water;
    this.gl.getClearColor(previousClear);
    const previousAlpha = this.gl.getClearAlpha();
    this.gl.setRenderTarget(this.target);
    this.gl.setClearColor(black, 1);
    this.gl.clear();
    this.gl.render(this.scene, this.camera);
    this.gl.setRenderTarget(null);
    this.gl.setClearColor(previousClear, previousAlpha);
  }

  dispose() {
    this.target.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}
