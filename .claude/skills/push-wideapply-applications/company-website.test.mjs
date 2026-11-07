import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanCompanyWebsite } from './company-website.mjs';

test('keeps a plausible site as an https origin', () => {
    assert.equal(cleanCompanyWebsite('arka.org'), 'https://arka.org');
    assert.equal(cleanCompanyWebsite('https://www.northropgrumman.com/careers?x=1'), 'https://www.northropgrumman.com');
    assert.equal(cleanCompanyWebsite('  http://Acme.io/path '), 'https://acme.io');
});

test('drops empty, malformed and non-company values', () => {
    for (const bad of [null, undefined, '', '   ', 'acme', 'localhost', '10.0.0.1', 'ftp://acme.com', 'https://', 'a b.com',
        'https://www.linkedin.com/company/acme', 'wellfound.com/company/acme', 'boards.greenhouse.io/acme', 'jobs.ashbyhq.com/acme',
        'acme.myworkdayjobs.com', 'gmail.com']) {
        assert.equal(cleanCompanyWebsite(bad), null, String(bad));
    }
});

import { applicationsWithoutWebsite } from './company-website.mjs';

test('lists applications that still have no company website', () => {
    const apps = [{ company: 'A', companyWebsite: 'https://a.com' }, { company: 'B', jobPostUrl: 'https://boards.greenhouse.io/b/1' }, { company: 'C', companyWebsite: undefined }];
    assert.deepEqual(applicationsWithoutWebsite(apps), [
        { index: 1, company: 'B', jobPostUrl: 'https://boards.greenhouse.io/b/1' },
        { index: 2, company: 'C', jobPostUrl: undefined }
    ]);
    assert.deepEqual(applicationsWithoutWebsite([]), []);
});
