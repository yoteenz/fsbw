import { useCallback, useEffect, useRef } from 'react';
import {
  EMAIL_LAYER_COPY_FIELD,
  attachEmailPreviewEditor,
  syncEmailPreviewActiveLayer,
  type EmailPreviewEditorCallbacks,
} from '../../utils/emailPreviewEditor';
import type { EmailLayoutLayerId, EmailLayerStyle, EmailTemplateCopyOverrides } from '../../utils/emailLayoutDebug';

type EmailPreviewFrameProps = {
  previewHtml: string;
  activeLayer: EmailLayoutLayerId;
  onSelectLayer: (layerId: EmailLayoutLayerId) => void;
  onPaddingChange: (layerId: EmailLayoutLayerId, patch: Partial<EmailLayerStyle>) => void;
  onCopyChange: (field: keyof EmailTemplateCopyOverrides, value: string | string[]) => void;
  onEditorTabForLayer: (layerId: EmailLayoutLayerId) => void;
};

export function EmailPreviewFrame({
  previewHtml,
  activeLayer,
  onSelectLayer,
  onPaddingChange,
  onCopyChange,
  onEditorTabForLayer,
}: EmailPreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleSelectLayer = useCallback(
    (layerId: EmailLayoutLayerId) => {
      onSelectLayer(layerId);
      onEditorTabForLayer(layerId);
    },
    [onEditorTabForLayer, onSelectLayer]
  );

  const attach = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !previewHtml) return;

    cleanupRef.current?.();
    const callbacks: EmailPreviewEditorCallbacks = {
      onSelectLayer: handleSelectLayer,
      onPaddingChange,
      onCopyChange,
    };
    cleanupRef.current = attachEmailPreviewEditor(doc, callbacks, activeLayer);
  }, [activeLayer, handleSelectLayer, onCopyChange, onPaddingChange, previewHtml]);

  useEffect(() => {
    attach();
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [attach]);

  useEffect(() => {
    syncEmailPreviewActiveLayer(iframeRef.current?.contentDocument, activeLayer);
  }, [activeLayer, previewHtml]);

  return (
    <iframe
      ref={iframeRef}
      title="Email template preview"
      srcDoc={previewHtml}
      className="w-full border-0"
      style={{ minHeight: '980px', background: '#ececec' }}
      onLoad={attach}
    />
  );
}

export function editorTabForEmailLayer(layerId: EmailLayoutLayerId): 'copy' | 'styles' {
  return EMAIL_LAYER_COPY_FIELD[layerId] ? 'copy' : 'styles';
}
