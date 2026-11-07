import test from 'node:test';
import assert from 'node:assert/strict';
import { validateJob, chunk } from './push-filtered-jobs.mjs';

const good = { company: 'Acme', role: 'Engineer', filterStage: 'jd_fit_gate', filterReasonCode: 'skill_mismatch', filterReason: 'Needs Spring Boot.' };

test('accepts a complete job', () => assert.equal(validateJob(good), null));
test('rejects missing reason, bad stage, bad code, bad bot', () => {
    assert.match(validateJob({ ...good, filterReason: ' ' }), /filterReason/);
    assert.match(validateJob({ ...good, filterStage: 'title' }), /filterStage/);
    assert.match(validateJob({ ...good, filterReasonCode: 'freshness' }), /filterReasonCode/);
    assert.match(validateJob({ ...good, filteredBy: 'human' }), /filteredBy/);
    assert.match(validateJob({ company: 'x' }), /company and role/);
});
test('chunks at 200', () => {
    assert.deepEqual(chunk(Array(450).fill(0)).map((c) => c.length), [200, 200, 50]);
});
