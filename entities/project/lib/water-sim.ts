import {
  FloatType,
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  type IUniform,
  type Texture,
  type WebGLRenderer,
} from "three";

import { dropFragment, fullscreenVertex, normalFragment, stepFragment } from "./water-shaders";

interface SimPass {
  material: ShaderMaterial;
  input: IUniform<Texture | null>;
}

function simulationTextureType(gl: WebGLRenderer) {
  const linearFloat =
    gl.extensions.has("EXT_color_buffer_float") && gl.extensions.has("OES_texture_float_linear");
  return linearFloat ? FloatType : HalfFloatType;
}

function createPass(fragmentShader: string, uniforms: Record<string, IUniform>): SimPass {
  const input: IUniform<Texture | null> = { value: null };
  const material = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader,
    uniforms: { ...uniforms, tInput: input },
  });
  return { material, input };
}

export class WaterSim {
  private read: WebGLRenderTarget;
  private write: WebGLRenderTarget;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: Mesh;
  private readonly extent: Vector2;
  private readonly dropCenter = new Vector2();
  private readonly dropRadius: IUniform<number> = { value: 0 };
  private readonly dropStrength: IUniform<number> = { value: 0 };
  private readonly drop: SimPass;
  private readonly step: SimPass;
  private readonly normals: SimPass;

  constructor(
    private readonly gl: WebGLRenderer,
    size: number,
    extent: readonly [number, number],
  ) {
    const options = {
      type: simulationTextureType(gl),
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.read = new WebGLRenderTarget(size, size, options);
    this.write = new WebGLRenderTarget(size, size, options);
    this.extent = new Vector2(extent[0], extent[1]);

    const delta = { value: new Vector2(1 / size, 1 / size) };
    this.drop = createPass(dropFragment, {
      center: { value: this.dropCenter },
      radius: this.dropRadius,
      strength: this.dropStrength,
    });
    this.step = createPass(stepFragment, { delta });
    this.normals = createPass(normalFragment, { delta, uExtent: { value: this.extent } });

    this.quad = new Mesh(new PlaneGeometry(2, 2), this.step.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    this.clear();
  }

  get texture(): Texture {
    return this.read.texture;
  }

  addDrop(x: number, z: number, radius: number, strength: number) {
    this.dropCenter.set(x / this.extent.x, z / this.extent.y);
    this.dropRadius.value = radius;
    this.dropStrength.value = strength;
    this.run(this.drop);
  }

  stepWaves() {
    this.run(this.step);
  }

  updateNormals() {
    this.run(this.normals);
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
    this.drop.material.dispose();
    this.step.material.dispose();
    this.normals.material.dispose();
    this.quad.geometry.dispose();
  }

  private clear() {
    const previous = this.gl.getRenderTarget();
    this.gl.setRenderTarget(this.read);
    this.gl.clear();
    this.gl.setRenderTarget(this.write);
    this.gl.clear();
    this.gl.setRenderTarget(previous);
  }

  private run(pass: SimPass) {
    pass.input.value = this.read.texture;
    this.quad.material = pass.material;
    this.gl.setRenderTarget(this.write);
    this.gl.render(this.scene, this.camera);
    this.gl.setRenderTarget(null);
    const swap = this.read;
    this.read = this.write;
    this.write = swap;
  }
}
