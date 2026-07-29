import { dataResponse, getRepo } from '@/backend/data/api';
import { requirePermission } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(async () => {
    await requirePermission('admin.users');
    return getRepo().getAuditLogs();
  });
}
