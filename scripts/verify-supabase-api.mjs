const base = process.env.API_BASE || 'http://localhost:3000';

async function check(path) {
  const res = await fetch(`${base}/api/data/${path}`);
  const json = await res.json();
  const count = Array.isArray(json.data) ? json.data.length : json.data ? 'object' : 0;
  console.log(`${path}: status=${res.status} provider=${json.provider} data=${count} error=${json.error || ''}`);
}

await check('jobs');
await check('companies');
await check('talent-pools');
await check('market-analysis');
await check('recommendations');
