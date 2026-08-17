import { handleBusinessNameCheckRequest } from '../../src/business-formation/businessNameRegistry/server/handler';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: Request): Promise<Response> {
  return handleBusinessNameCheckRequest(req);
}
