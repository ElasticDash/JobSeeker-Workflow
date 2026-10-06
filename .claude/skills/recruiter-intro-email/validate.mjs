#!/usr/bin/env node
// validate.mjs
//
// Usage: node validate.mjs <draft.json>
//
// Deterministic pre-delivery check for a recruiter-intro-email draft. Exists
// because the lens (120-200 words, "Hi [First Name]," greeting, one ask,
// nothing after the signature, exact contact details) is pure prompt text
// with nothing enforcing it - a model drifts from a stated word count or
// retypes a phone/LinkedIn from memory instead of copying it, under real
// conditions. Same lesson already learned and fixed in ElasticDash-BE's
// emailSequenceGenerator.js (countWords/findOverLengthEmails + a bounded
// retry) - this is that same backstop for this skill, which has no code
// path of its own to hook a check into otherwise.
//
// Input shape (draft.json):
// {
//   "subject": "...",
//   "body": "...",                 // full email body, greeting through signature
//   "candidateName": "Agrima Jain",
//   "candidatePhone": "+1 206-555-0123",   // the REAL value from the candidate's profile/resume
//   "candidateLinkedin": "linkedin.com/in/agrimajain", // the REAL value
//   "seniorRole": false             // true for staff/principal/lead/director target roles
// }
//
// Prints { pass: bool, violations: [...] } as JSON and exits 1 if any
// violation was found, 0 otherwise.

import { readFileSync } from 'node:fs';

const WORD_LIMIT_MIN = 120;
const WORD_LIMIT_MAX = 200;
const WORD_LIMIT_MAX_SENIOR = 220;

const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

const normalizeLinkedin = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

function validate(draft) {
    const violations = [];
    const body = String(draft.body || '');
    const subject = String(draft.subject || '');
    const lines = body.split('\n').map((l) => l.trim());
    const nonEmptyLines = lines.filter((l) => l.length > 0);

    // --- length ---
    const wordCount = countWords(body);
    const max = draft.seniorRole ? WORD_LIMIT_MAX_SENIOR : WORD_LIMIT_MAX;
    if (wordCount < WORD_LIMIT_MIN || wordCount > max) {
        violations.push(`word count is ${wordCount}, outside the ${WORD_LIMIT_MIN}-${max} range`);
    }

    // --- greeting ---
    if (!/^Hi\s+\S/.test(nonEmptyLines[0] || '')) {
        violations.push('body does not open with a "Hi [Name]," greeting line');
    }

    // --- subject ---
    if (!subject.trim()) {
        violations.push('subject line is missing');
    } else if (!/application/i.test(subject)) {
        violations.push(`subject "${subject}" does not look like a "[Job Title] application - [Name]" subject`);
    }

    // --- unfilled placeholders ---
    if (body.includes('[') || subject.includes('[')) {
        violations.push('an unfilled "[" placeholder remains in the subject or body');
    }

    // --- nothing after the signature block ---
    // The signature is the last non-empty line (phone | LinkedIn) preceded by
    // the candidate's name and a "Thanks," line. Anything found after that
    // triple is a second message tacked on past the sign-off - exactly the
    // "Happy to walk you through..." trailer that showed up in practice.
    const thanksIdx = lines.findIndex((l) => /^thanks,?$/i.test(l));
    if (thanksIdx === -1) {
        violations.push('no "Thanks," sign-off line found');
    } else {
        // Expect: Thanks, / Name / Phone | LinkedIn, then nothing else non-empty.
        const afterSignature = lines.slice(thanksIdx + 3).filter((l) => l.length > 0);
        if (afterSignature.length > 0) {
            violations.push(`content found after the signature block: "${afterSignature[0]}"`);
        }
    }

    // --- exact contact match (never retyped from memory) ---
    if (draft.candidatePhone) {
        const wantPhone = digitsOnly(draft.candidatePhone);
        const bodyDigitsRuns = body.match(/[\d()+\-\s]{7,}/g) || [];
        const matched = bodyDigitsRuns.some((run) => digitsOnly(run) === wantPhone);
        if (!matched) {
            violations.push(`phone in body does not exactly match the candidate's real phone number (${draft.candidatePhone})`);
        }
    }
    if (draft.candidateLinkedin) {
        const wantLinkedin = normalizeLinkedin(draft.candidateLinkedin);
        const bodyLower = body.toLowerCase();
        if (!bodyLower.includes(wantLinkedin)) {
            violations.push(`LinkedIn URL in body does not exactly match the candidate's real LinkedIn (${draft.candidateLinkedin})`);
        }
    }

    // --- single ask (best-effort heuristic) ---
    // Count ASK-BEARING SENTENCES, not keyword matches - one sentence can
    // legitimately contain several CTA-ish words ("I'd be glad to walk you
    // through X on a short call" is one ask, not three).
    const ctaPhrase = /(short call|happy to|glad to|would you be open|let me know|walk you through|available for a call)/i;
    const sentences = body.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
    const ctaSentences = sentences.filter((s) => ctaPhrase.test(s));
    if (ctaSentences.length > 1) {
        violations.push(`more than one ask found (${ctaSentences.length} CTA sentences: ${ctaSentences.join(' | ')}) - expected exactly one`);
    }

    return violations;
}

function main() {
    const path = process.argv[2];
    if (!path) {
        console.error('Usage: node validate.mjs <draft.json>');
        process.exitCode = 1;
        return;
    }
    const draft = JSON.parse(readFileSync(path, 'utf8'));
    const violations = validate(draft);
    console.log(JSON.stringify({ pass: violations.length === 0, violations }, null, 2));
    if (violations.length > 0) process.exitCode = 1;
}

main();
