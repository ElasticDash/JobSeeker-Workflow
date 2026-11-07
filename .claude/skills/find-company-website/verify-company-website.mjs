// verify-company-website.mjs
//
// Decides whether a candidate URL really is the company's own site. Used by the find-company-website skill, which finds
// candidates with a TinyFish search; this file is the deterministic gate so a wrong site never reaches a cover letter.
// Accepts only when BOTH hold: the company name is in the page's title / opening text, AND the domain carries the name.
// A name that only appears somewhere in the body of an unrelated page is not enough.

import { cleanCompanyWebsite } from '../push-wideapply-applications/company-website.mjs';

const LEGAL_SUFFIXES = new Set(['inc', 'incorporated', 'llc', 'ltd', 'limited', 'corp', 'corporation', 'co', 'company', 'gmbh', 'plc', 'sa', 'ag', 'pty', 'lp', 'llp', 'the']);
const SECOND_LEVEL = new Set(['co', 'com', 'org', 'net', 'gov', 'ac', 'edu']);
const OPENING_CHARS = 1500;

const words = (value) => String(value ?? '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);

/** Name tokens without legal suffixes ("Acme, Inc." -> ["acme"]). Falls back to all tokens if nothing is left. */
export function nameTokens(company) {
    const all = words(company);
    const kept = all.filter((w) => !LEGAL_SUFFIXES.has(w));
    return kept.length ? kept : all;
}

/** The registrable label of a host ("www.acme-corp.co.uk" -> "acme-corp"). */
function domainLabel(host) {
    const labels = host.replace(/^www\./, '').split('.');
    if (labels.length < 2) return '';
    labels.pop();
    if (labels.length > 1 && SECOND_LEVEL.has(labels[labels.length - 1])) labels.pop();
    return labels[labels.length - 1];
}

const registrable = (host) => host.replace(/^www\./, '').split('.').slice(-2).join('.');

/** @returns {{ ok: boolean, website: string|null, reason: string }} Never throws. */
export function verifyCompanyWebsite({ company, url, title = '', text = '', jobPostUrl = '' } = {}) {
    const website = cleanCompanyWebsite(url);
    if (!website) return { ok: false, website: null, reason: 'not a plausible company site (job board, social, ATS or malformed)' };
    const host = new URL(website).hostname.toLowerCase();

    let jobHost = '';
    try {
        jobHost = new URL(String(jobPostUrl)).hostname.toLowerCase();
    } catch {
        /* no job URL */
    }
    if (jobHost && registrable(jobHost) === registrable(host)) return { ok: false, website: null, reason: 'same site as the job posting, not the company\'s own' };

    const tokens = nameTokens(company);
    if (!tokens.length) return { ok: false, website: null, reason: 'no company name to check against' };
    const compact = tokens.join('');
    const label = domainLabel(host).replace(/[^a-z0-9]/g, '');
    const domainMatch = label.length >= 3 && (label.includes(compact) || (compact.length >= 4 && compact.includes(label)) || (tokens[0].length >= 4 && label.includes(tokens[0])));
    if (!domainMatch) return { ok: false, website: null, reason: `the domain (${host}) does not carry the company name` };

    const opening = words(`${title} ${String(text).slice(0, OPENING_CHARS)}`).join(' ');
    const pageMatch = ` ${opening} `.includes(` ${tokens.join(' ')} `) || opening.replace(/ /g, '').includes(compact);
    if (!pageMatch) return { ok: false, website: null, reason: 'the company name is not in the page title or opening text' };

    return { ok: true, website, reason: 'name found in the page and in the domain' };
}
