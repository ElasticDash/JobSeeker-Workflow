#!/usr/bin/env node
// Shared US-location screen for every job source (Hirebase, TheirStack,
// Apify/Wellfound, fetch-ats-jobs, GrokBot/markdown imports). Added
// 2026-10-28, user directive: US-only must be enforced AFTER jobs are
// received, regardless of whether the source has a native geo filter (every
// provider's own filter has leaked non-US postings on real runs).
//
// Library:  import { classifyJob, classifyUsLocation } from '.../us-location-filter.mjs'
// CLI:      node .claude/skills/us-location-filter/us-location-filter.mjs <jobs.json> [--out <dir>] [--keep-non-us]
//   <jobs.json> is an array, or an object with a jobs[] / data[] array.
//   Writes <dir>/us_kept.json (us + unknown, each with usStatus) and
//   <dir>/non_us_dropped.json, and prints counts. Default <dir> = alongside input.
//
// usStatus: "us"      a US location (or US-remote) is listed -> keep
//           "non-us"  only non-US locations -> DROP (never counts toward N)
//           "unknown" no usable location ("Remote", "Hybrid", "2 Locations")
//                     -> keep but the caller MUST confirm US eligibility from
//                     the JD text before logging; drop if the JD only names
//                     non-US work locations.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const US_STATE_NAMES = 'alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|district of columbia';
const US_CITIES = 'san francisco|new york|nyc|seattle|austin|boston|chicago|los angeles|san diego|san jose|denver|atlanta|dallas|houston|miami|portland|salt lake city|washington, ?dc|philadelphia|phoenix|raleigh|palo alto|mountain view|sunnyvale|redwood city|menlo park|santa clara|brooklyn|pittsburgh|nashville|buffalo|minneapolis|detroit|boulder|bay area|silicon valley';
const US_RE = new RegExp(`\\b(united states|usa|u\\.s\\.a?\\.?|us|${US_STATE_NAMES}|${US_CITIES})\\b|,\\s*(AL|AK|AZ|AR|CA|CO|CT|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\\b`, 'i');
const NON_US_RE = /\b(canada|toronto|vancouver|montreal|ottawa|calgary|ontario|british columbia|alberta|quebec|united kingdom|uk|england|scotland|wales|london|manchester|edinburgh|ireland|dublin|germany|berlin|munich|france|paris|spain|madrid|barcelona|portugal|lisbon|italy|milan|netherlands|amsterdam|belgium|brussels|sweden|stockholm|norway|oslo|denmark|copenhagen|finland|helsinki|poland|warsaw|czech|prague|austria|vienna|switzerland|zurich|geneva|romania|bulgaria|hungary|greece|ukraine|estonia|latvia|lithuania|emea|europe|european union|eu|india|bengaluru|bangalore|hyderabad|mumbai|pune|delhi|gurgaon|gurugram|chennai|noida|singapore|japan|tokyo|korea|seoul|china|beijing|shanghai|shenzhen|hong kong|taiwan|taipei|philippines|manila|vietnam|thailand|bangkok|indonesia|jakarta|malaysia|kuala lumpur|australia|sydney|melbourne|new zealand|auckland|apac|israel|tel aviv|turkey|istanbul|dubai|uae|united arab emirates|saudi|egypt|nigeria|lagos|kenya|nairobi|south africa|cape town|brazil|sao paulo|são paulo|mexico|argentina|buenos aires|colombia|bogota|chile|santiago|peru|lima|latam|costa rica|pakistan|bangladesh|sri lanka)\b/i;

export function classifyUsLocation(...texts) {
    const t = texts.flat().filter(Boolean).join(' | ');
    if (!t.trim()) return 'unknown';
    if (US_RE.test(t)) return 'us';
    if (NON_US_RE.test(t)) return 'non-us';
    return 'unknown';
}

const US_COUNTRY_RE = /^(us|usa|u\.s\.a?\.?|united states( of america)?)$/i;

// Structured country values (a field that is *only* a country name/code): any
// US entry -> us, else any non-empty entry -> non-us. Avoids the "CA" =
// California/Canada ambiguity that free text has.
function classifyCountries(values) {
    // Some sources join several locations into one string ("United States | US - Remote"); split first.
    const v = values.flat().flatMap((x) => (typeof x === 'string' ? x.split('|') : [])).filter((x) => x.trim());
    if (!v.length) return 'unknown';
    if (v.some((x) => US_COUNTRY_RE.test(x.trim()))) return 'us';
    return 'non-us';
}

// Pulls location signals from any provider's job shape.
export function classifyJob(j) {
    const countries = [];
    const texts = [];
    const push = (arr, v) => { if (v == null) return; if (Array.isArray(v)) v.forEach((x) => push(arr, x)); else if (typeof v === 'object') { for (const k of ['city', 'region', 'state', 'country', 'name', 'text']) if (typeof v[k] === 'string') arr.push(v[k]); } else arr.push(String(v)); };
    // Hirebase: locations[] = [{city, region, country}]
    if (Array.isArray(j.locations)) {
        for (const l of j.locations) {
            if (l && typeof l === 'object') { if (l.country) countries.push(l.country); push(texts, [l.city, l.region]); }
            else push(texts, l);
        }
    }
    // TheirStack: country_code / countries, short_location / long_location / location
    for (const k of ['country', 'country_code', 'job_country_code', 'locationCountry']) if (typeof j[k] === 'string') countries.push(j[k]);
    if (Array.isArray(j.countries)) countries.push(...j.countries);
    if (j.country_codes) push(countries, j.country_codes);
    for (const k of ['location', 'short_location', 'long_location', 'city', 'locationNames', 'locationsText', 'remoteType', 'remote_type']) push(texts, j[k]);
    const byCountry = classifyCountries(countries);
    // A structured country is authoritative; free text is only the fallback
    // (its "CA"/"IN"/"DE" state-vs-country codes are ambiguous).
    if (byCountry !== 'unknown') return byCountry;
    return classifyUsLocation(texts);
}

function main() {
    const argv = process.argv.slice(2);
    const file = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--out');
    if (!file) { console.error('Usage: node us-location-filter.mjs <jobs.json> [--out <dir>] [--keep-non-us]'); process.exitCode = 1; return; }
    const outIdx = argv.indexOf('--out');
    const outDir = outIdx >= 0 ? argv[outIdx + 1] : dirname(file);
    const keepNonUs = argv.includes('--keep-non-us');
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    const jobs = Array.isArray(raw) ? raw : (raw.jobs || raw.data || []);
    const kept = []; const dropped = [];
    for (const j of jobs) {
        j.usStatus = classifyJob(j);
        (j.usStatus === 'non-us' && !keepNonUs ? dropped : kept).push(j);
    }
    writeFileSync(join(outDir, 'us_kept.json'), JSON.stringify(kept, null, 2));
    writeFileSync(join(outDir, 'non_us_dropped.json'), JSON.stringify(dropped, null, 2));
    const unknown = kept.filter((j) => j.usStatus === 'unknown').length;
    console.log(`US screen: ${jobs.length} in -> ${kept.length} kept (${kept.length - unknown} us, ${unknown} unknown: confirm from JD), ${dropped.length} non-US dropped. Wrote ${join(outDir, 'us_kept.json')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
