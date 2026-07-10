/**
 * Explicit lookup options for scene stack layer resolution.
 * Compiler paths must pass previewSessionId — never rely on global singletons.
 */

export type SceneStackLayerLookupOptions = {
  /** Explicit preview session — required for Experience Lab ephemeral shell reads */
  previewSessionId?: string;
  /** When true with previewSessionId, reads ephemeral validation overlay */
  validationMode?: boolean;
};
