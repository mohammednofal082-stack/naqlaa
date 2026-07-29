import fs from 'node:fs';

const p = new URL('../apps/web/.env.local', import.meta.url);
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/NEXT_PUBLIC_DATA_PROVIDER=\w+/, 'NEXT_PUBLIC_DATA_PROVIDER=supabase');
c = c.replace(/NEXT_PUBLIC_AUTH_PROVIDER=\w+/, 'NEXT_PUBLIC_AUTH_PROVIDER=supabase');
if (!/NEXT_PUBLIC_DATA_PROVIDER=/.test(c)) c += '\nNEXT_PUBLIC_DATA_PROVIDER=supabase\n';
if (!/NEXT_PUBLIC_AUTH_PROVIDER=/.test(c)) c += '\nNEXT_PUBLIC_AUTH_PROVIDER=supabase\n';
fs.writeFileSync(p, c);
const data = c.match(/NEXT_PUBLIC_DATA_PROVIDER=(\w+)/)?.[1];
const auth = c.match(/NEXT_PUBLIC_AUTH_PROVIDER=(\w+)/)?.[1];
console.log(`DATA=${data} AUTH=${auth}`);
