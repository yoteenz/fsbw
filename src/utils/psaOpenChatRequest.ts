export const PSA_OPEN_CHAT_REQUEST_EVENT = 'psaOpenChatRequest';

export type PsaOpenChatRequestDetail = {
  prefillMessage?: string;
};

/** Ask the PSA widget to open with an optional prefilled composer message. */
export function requestOpenPsaChat(detail?: PsaOpenChatRequestDetail): void {
  window.dispatchEvent(new CustomEvent(PSA_OPEN_CHAT_REQUEST_EVENT, { detail: detail ?? {} }));
}
