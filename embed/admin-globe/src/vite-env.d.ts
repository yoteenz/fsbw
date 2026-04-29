/// <reference types="vite/client" />

declare module 'three' {
  export type Object3D = Group;

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
  }
  export class BufferGeometry {
    setAttribute(name: string, attribute: BufferAttribute): void;
    computeVertexNormals(): void;
    dispose(): void;
  }
  export class BufferAttribute {
    constructor(array: Float32Array, itemSize: number);
  }
  export class MeshLambertMaterial {
    constructor(parameters?: Record<string, unknown>);
    color: { set: (c: number) => void };
    transparent: boolean;
    opacity: number;
    side: number;
  }
  export class Mesh {
    constructor(geometry?: BufferGeometry, material?: MeshLambertMaterial | MeshLambertMaterial[]);
    geometry: BufferGeometry;
    userData: Record<string, unknown>;
  }
  export class Group {
    children: Mesh[];
    add(object: Mesh): this;
    remove(object: Mesh): this;
  }
  export const DoubleSide: number;
}
