import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyJobUrl, reviewJobUrls } from './job-url-platform.mjs';

test('employer ATS hosts are recognised', () => {
    assert.deepEqual(classifyJobUrl('https://boards.greenhouse.io/acme/jobs/1'), { kind: 'employer_ats', platform: 'Greenhouse' });
    assert.equal(classifyJobUrl('https://jobs.ashbyhq.com/acme/abc').platform, 'Ashby');
    assert.equal(classifyJobUrl('https://acme.wd5.myworkdayjobs.com/en-US/x/job/1').platform, 'Workday');
    assert.equal(classifyJobUrl('https://jobs.lever.co/acme/1').platform, 'Lever');
});

test('every Built In city host is a refused board', () => {
    for (const h of ['builtin.com', 'www.builtin.com', 'builtinnyc.com', 'builtinsf.com', 'builtinaustin.com', 'builtincolorado.com']) {
        assert.deepEqual(classifyJobUrl(`https://${h}/job/x/1`), { kind: 'board', platform: 'Built In', refuse: true }, h);
    }
});

test('other boards are reported but not refused', () => {
    assert.deepEqual(classifyJobUrl('https://www.linkedin.com/jobs/view/1'), { kind: 'board', platform: 'LinkedIn', refuse: false });
    assert.equal(classifyJobUrl('https://wellfound.com/jobs/1-x').platform, 'Wellfound');
    assert.equal(classifyJobUrl('https://uk.indeed.com/viewjob?jk=1').platform, 'Indeed');
    assert.equal(classifyJobUrl('https://startup.jobs/sr-engineer-1').platform, 'startup.jobs');
});

test('an employer careers site or a bad URL is unknown, and a path never counts', () => {
    assert.equal(classifyJobUrl('https://acme.com/careers/12').kind, 'unknown');
    assert.equal(classifyJobUrl('https://acme.com/linkedin.com/jobs').kind, 'unknown');
    assert.equal(classifyJobUrl('not a url').kind, 'unknown');
    assert.equal(classifyJobUrl(undefined).kind, 'unknown');
    assert.equal(classifyJobUrl('https://notbuiltin.com/x').kind, 'unknown');
});

test('reviewJobUrls separates refused, on-board and counts', () => {
    const r = reviewJobUrls([
        { company: 'A', role: 'r', jobPostUrl: 'https://jobs.lever.co/a/1' },
        { company: 'B', role: 'r', jobPostUrl: 'https://builtinnyc.com/job/b/2' },
        { company: 'C', role: 'r', jobPostUrl: 'https://wellfound.com/jobs/3' },
        { company: 'D', role: 'r', jobPostUrl: 'https://d.com/careers' }
    ]);
    assert.deepEqual(r.counts, { employerAts: 1, board: 2, unknown: 1 });
    assert.deepEqual(r.refused.map((x) => x.company), ['B']);
    assert.deepEqual(r.onBoard.map((x) => [x.company, x.platform]), [['C', 'Wellfound']]);
});

import { forcedAtsFor, isAutoApplySupportedUrl } from './job-url-platform.mjs';
import { test as t2 } from 'node:test';
import assert2 from 'node:assert/strict';

t2('forcedAtsFor: set only when the host hides a forceable ATS', () => {
    assert2.equal(forcedAtsFor('ashby', 'https://cursor.com/careers/software-engineer-bugbot'), 'ashby');
    assert2.equal(forcedAtsFor('greenhouse', 'https://www.sofi.com/careers/job/8198207003'), 'greenhouse');
    assert2.equal(forcedAtsFor('ashby', 'https://jobs.ashbyhq.com/mercor/x'), undefined);
    assert2.equal(forcedAtsFor('lever', 'https://example.com/x'), undefined);
    assert2.equal(isAutoApplySupportedUrl('https://x.wd1.myworkdayjobs.com/a'), true);
});
