import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';

export type ResendEmailInput = {
  to: string;
  subject: string;
  html: string;
  preheader?: string;
};

export type ResendEmailOutput = {
  messageId: string;
  status: 'queued';
};

export const resendStudioService: StudioServiceStub & {
  sendPackEmail(_input: ResendEmailInput): Promise<StudioServiceResult<ResendEmailOutput>>;
  sendPreview(_input: ResendEmailInput): Promise<StudioServiceResult<ResendEmailOutput>>;
} = {
  id: 'resend',
  label: 'RESEND',
  phase: 2,
  enabled: false,
  description: 'CONTENT PACK EMAIL DROPS · CRM PREVIEWS',
  async sendPackEmail() {
    return studioServiceNotConnected('Resend is not connected. Wire Resend API in Phase 2.');
  },
  async sendPreview() {
    return studioServiceNotConnected('Resend preview is not connected. Wire Resend API in Phase 2.');
  },
};
