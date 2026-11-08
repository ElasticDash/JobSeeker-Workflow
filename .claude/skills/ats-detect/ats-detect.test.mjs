import test from 'node:test';
import assert from 'node:assert/strict';
import { detectFromUrl, detectFromHtml, detectAts, looksLikeShell } from './ats-detect.mjs';

test('url: greenhouse host with token and job id', () => {
    const r = detectFromUrl('https://job-boards.greenhouse.io/acme/jobs/4567890');
    assert.deepEqual([r.ats, r.boardToken, r.jobId, r.via], ['greenhouse', 'acme', '4567890', 'url-host']);
    assert.equal(r.applyUrl, 'https://job-boards.greenhouse.io/acme/jobs/4567890');
});
test('url: EU host and embed form', () => {
    assert.equal(detectFromUrl('https://job-boards.eu.greenhouse.io/acme/jobs/1').boardToken, 'acme');
    assert.equal(detectFromUrl('https://job-boards.greenhouse.io/embed/job_app?for=acme&token=99').boardToken, 'acme');
});
test('url: custom careers site with gh_jid', () => {
    const r = detectFromUrl('https://careers.acme.com/jobs?gh_jid=123&gh_src=abc');
    assert.deepEqual([r.ats, r.boardToken, r.jobId, r.via], ['greenhouse', null, '123', 'url-gh_jid']);
});
test('url: non greenhouse is null', () => {
    assert.equal(detectFromUrl('https://jobs.lever.co/acme/1'), null);
    assert.equal(detectFromUrl('not a url'), null);
});
test('html: loader script, container, and plain link', () => {
    assert.equal(detectFromHtml('<script src="https://boards.greenhouse.io/embed/job_board/js?for=acme"></script>').boardToken, 'acme');
    assert.equal(detectFromHtml('<div id="grnhse_app"></div>').via, 'html-container');
    const r = detectFromHtml('<a href="https://job-boards.greenhouse.io/acme/jobs/777">Apply</a>', 'https://x.com');
    assert.deepEqual([r.boardToken, r.jobId], ['acme', '777']);
    assert.equal(detectFromHtml('<html>hello</html>'), null);
});
test('shell detection', () => {
    assert.equal(looksLikeShell('<html><body><div id="root"></div><script src="a.js"></script></body></html>'), true);
    assert.equal(looksLikeShell('<html><body>' + 'word '.repeat(200) + '</body></html>'), false);
});
test('detectAts: html tier fills the per-host cache, second job needs no fetch', async () => {
    const cache = {}; let calls = 0;
    const fetchImpl = async () => { calls += 1; return { ok: true, text: async () => '<script src="https://boards.greenhouse.io/embed/job_board/js?for=acme"></script>' }; };
    const a = await detectAts('https://careers.acme.com/jobs/1', { cache, fetchImpl });
    assert.equal(a.boardToken, 'acme');
    const b = await detectAts('https://careers.acme.com/jobs/2', { cache, fetchImpl });
    assert.deepEqual([b.ats, b.boardToken, b.via], ['greenhouse', 'acme', 'cache']);
    assert.equal(calls, 1);
});
test('detectAts: shell flags needsRender, plain page is cached as none', async () => {
    const shell = async () => ({ ok: true, text: async () => '<div id="root"></div>' });
    assert.equal((await detectAts('https://a.com/j', { cache: {}, fetchImpl: shell })).needsRender, true);
    const plain = async () => ({ ok: true, text: async () => '<html>' + 'word '.repeat(200) + '</html>' });
    const cache = {};
    assert.equal((await detectAts('https://b.com/j', { cache, fetchImpl: plain })).ats, null);
    assert.equal(cache['b.com'].ats, 'none');
});
