import { dataResponse, getRepo } from '@/lib/data/api';

export async function GET() {
  return dataResponse(async () => ({
    jobs: await getRepo().getSavedJobs(),
    companies: await getRepo().getSavedCompanies(),
  }));
}
