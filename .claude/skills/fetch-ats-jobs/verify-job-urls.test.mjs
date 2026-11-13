import test from 'node:test';
import assert from 'node:assert/strict';
import { slugifyTitle, candidateUrls, resolveJobUrl } from './verify-job-urls.mjs';

const res = (status, url = '') => async () => ({ status, url });
const byUrl = (map) => async (u) => ({ status: map[u] ?? 404, url: u });

test('slugifyTitle matches cursor.com/careers slugs', () => {
    assert.equal(slugifyTitle('Software Engineer, Model Routing & Inference'), 'software-engineer-model-routing-inference');
    assert.equal(slugifyTitle('Software Engineer, Bugbot'), 'software-engineer-bugbot');
});

test('cursor gets a cursor.com/careers fallback, others do not', () => {
    const c = candidateUrls({ company: 'Cursor (Anysphere)', title: 'Software Engineer, Storage', url: 'https://jobs.ashbyhq.com/cursor/x' });
    assert.deepEqual(c, ['https://jobs.ashbyhq.com/cursor/x', 'https://cursor.com/careers/software-engineer-storage']);
    assert.equal(candidateUrls({ company: 'Mercor', title: 'A', url: 'u' }).length, 1);
});

test('live url stays', async () => {
    const r = await resolveJobUrl({ company: 'Mercor', title: 'A', url: 'u' }, { fetchImpl: res(200, 'u') });
    assert.equal(r.urlStatus, 'live');
});

test('dead ashby url is rewritten to cursor.com/careers', async () => {
    const job = { company: 'Cursor (Anysphere)', title: 'Software Engineer, Bugbot', url: 'https://jobs.ashbyhq.com/cursor/x' };
    const r = await resolveJobUrl(job, { fetchImpl: byUrl({ 'https://cursor.com/careers/software-engineer-bugbot': 200 }) });
    assert.deepEqual(r, { urlStatus: 'rewritten', url: 'https://cursor.com/careers/software-engineer-bugbot', urlOriginal: job.url });
});

test('404 with no fallback is dead; timeout is unverified; greenhouse error redirect is dead', async () => {
    assert.equal((await resolveJobUrl({ company: 'X', title: 'A', url: 'u' }, { fetchImpl: res(404) })).urlStatus, 'dead');
    assert.equal((await resolveJobUrl({ company: 'X', title: 'A', url: 'u' }, { fetchImpl: async () => { throw new Error('t'); } })).urlStatus, 'unverified');
    assert.equal((await resolveJobUrl({ company: 'X', title: 'A', url: 'u' }, { fetchImpl: res(200, 'https://b.greenhouse.io/x?error=true') })).urlStatus, 'dead');
});
