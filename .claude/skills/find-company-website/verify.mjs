// CLI wrapper: JSON on stdin -> one JSON line on stdout. See verify-company-website.mjs.
import { verifyCompanyWebsite } from './verify-company-website.mjs';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
let input;
try {
    input = JSON.parse(raw);
} catch {
    console.log(JSON.stringify({ ok: false, website: null, reason: 'stdin was not valid JSON' }));
    process.exit(1);
}
console.log(JSON.stringify(verifyCompanyWebsite(input)));
