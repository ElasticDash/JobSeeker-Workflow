import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyCompanyWebsite, nameTokens } from './verify-company-website.mjs';

const page = (title, text = '') => ({ title, text });

test('accepts a site whose domain and page both carry the name', () => {
    const r = verifyCompanyWebsite({ company: 'Arka', url: 'https://www.arka.org/about', ...page('Arka | Home', 'Arka builds things') });
    assert.deepEqual([r.ok, r.website], [true, 'https://www.arka.org']);
});

test('strips legal suffixes and punctuation from the name', () => {
    assert.deepEqual(nameTokens('Acme Robotics, Inc.'), ['acme', 'robotics']);
    const r = verifyCompanyWebsite({ company: 'Acme Robotics, Inc.', url: 'acmerobotics.com', ...page('Acme Robotics - autonomous arms') });
    assert.equal(r.ok, true);
});

test('handles hyphenated domains and co.uk style hosts', () => {
    assert.equal(verifyCompanyWebsite({ company: 'Blue Harbor Ltd', url: 'https://www.blue-harbor.co.uk', ...page('Blue Harbor') }).ok, true);
});

test('rejects when the domain does not carry the name', () => {
    const r = verifyCompanyWebsite({ company: 'Arka', url: 'https://example.com', ...page('Arka mentioned here') });
    assert.equal(r.ok, false);
    assert.match(r.reason, /domain/);
});

test('rejects when the name is only deep in the page body, not the title or opening text', () => {
    const r = verifyCompanyWebsite({ company: 'Arka', url: 'https://arka.dev', ...page('Welcome', `${'filler '.repeat(400)}arka`) });
    assert.equal(r.ok, false);
    assert.match(r.reason, /title or opening/);
});

test('rejects boards, social, ATS and aggregator hosts', () => {
    for (const url of ['https://www.linkedin.com/company/arka', 'https://boards.greenhouse.io/arka', 'https://wellfound.com/company/arka', 'https://builtin.com/company/arka']) {
        assert.equal(verifyCompanyWebsite({ company: 'Arka', url, ...page('Arka') }).ok, false, url);
    }
});

test('rejects the job posting\'s own site', () => {
    const r = verifyCompanyWebsite({ company: 'Arka', url: 'https://arka.com', jobPostUrl: 'https://careers.arka.com/jobs/1', ...page('Arka') });
    assert.equal(r.ok, false);
});

test('rejects a lookalike: a different company whose domain merely contains the name', () => {
    const r = verifyCompanyWebsite({ company: 'Apex', url: 'https://apexroofing.com', ...page('Apex Roofing - Dallas') });
    // Name and domain match, so this passes the gate: callers must still check the company's field, which is why the
    // skill tells Claude to compare the page's description with the job posting. Documented here so it is not forgotten.
    assert.equal(r.ok, true);
});

test('never throws on empty or odd input', () => {
    assert.equal(verifyCompanyWebsite().ok, false);
    assert.equal(verifyCompanyWebsite({ company: '', url: 'https://arka.org' }).ok, false);
    assert.equal(verifyCompanyWebsite({ company: 'Arka', url: 'not a url' }).ok, false);
});
