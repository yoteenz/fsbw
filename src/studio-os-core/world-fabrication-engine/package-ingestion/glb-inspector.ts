import { readFileSync } from 'node:fs';
import type { GlbInspectionResult } from './types';
import { sha256File } from './inventory';

type GltfJson = {
  scenes?: number[];
  scene?: number;
  nodes?: { name?: string; mesh?: number; children?: number[] }[];
  meshes?: { name?: string; primitives?: { attributes?: Record<string, number>; indices?: number }[] }[];
  materials?: { name?: string }[];
  textures?: unknown[];
  images?: unknown[];
  extensionsUsed?: string[];
  accessors?: { count?: number; type?: string; componentType?: number }[];
};

function readGlbJson(buffer: Buffer): { json: GltfJson; errors: string[] } {
  const errors: string[] = [];
  if (buffer.length < 12) {
    return { json: {}, errors: ['File too small for GLB header'] };
  }
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) {
    return { json: {}, errors: ['Invalid GLB magic (expected glTF)'] };
  }
  const version = buffer.readUInt32LE(4);
  if (version !== 2) {
    errors.push(`Unexpected GLB version ${version}`);
  }
  const length = buffer.readUInt32LE(8);
  if (length > buffer.length) {
    errors.push('GLB header length exceeds file size');
  }
  const chunk0Length = buffer.readUInt32LE(12);
  const chunk0Type = buffer.readUInt32LE(16);
  if (chunk0Type !== 0x4e4f534a) {
    return { json: {}, errors: ['First chunk is not JSON'] };
  }
  const jsonBytes = buffer.subarray(20, 20 + chunk0Length);
  try {
    const json = JSON.parse(jsonBytes.toString('utf8')) as GltfJson;
    return { json, errors };
  } catch {
    return { json: {}, errors: ['Failed to parse GLB JSON chunk'] };
  }
}

function countTriangles(json: GltfJson): number {
  let total = 0;
  const accessors = json.accessors ?? [];
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      if (prim.indices === undefined) continue;
      const acc = accessors[prim.indices];
      if (acc?.count) total += Math.floor(acc.count / 3);
    }
  }
  return total;
}

export function inspectGlbFile(filePath: string): GlbInspectionResult {
  const buffer = readFileSync(filePath);
  const sha256 = sha256File(filePath);
  const { json, errors } = readGlbJson(buffer);

  const meshCount = json.meshes?.length ?? 0;
  const nodeCount = json.nodes?.length ?? 0;
  const materialNames = (json.materials ?? []).map((m, i) => m.name ?? `material_${i}`);
  const textureCount = json.textures?.length ?? 0;
  const embeddedImageCount = json.images?.length ?? 0;
  const triangleCount = countTriangles(json);
  const extensionsUsed = json.extensionsUsed ?? [];

  const sceneIndex = json.scene ?? 0;
  const sceneRootNodeNames: string[] = [];
  const nodes = json.nodes ?? [];
  const sceneDef = (json as { scenes?: { nodes?: number[] }[] }).scenes?.[sceneIndex];
  if (sceneDef?.nodes) {
    for (const idx of sceneDef.nodes) {
      sceneRootNodeNames.push(nodes[idx]?.name ?? `node_${idx}`);
    }
  }

  let positions = 0;
  let indices = 0;
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      if (prim.attributes?.POSITION !== undefined) positions += 1;
      if (prim.indices !== undefined) indices += 1;
    }
  }

  return {
    filePath,
    sha256,
    fileBytes: buffer.length,
    parseOk: errors.length === 0 && meshCount > 0,
    parseErrors: errors,
    meshCount,
    nodeCount,
    materialNames,
    textureCount,
    embeddedImageCount,
    triangleCount,
    extensionsUsed,
    sceneRootNodeNames,
    accessorSummary: { positions, indices },
  };
}
