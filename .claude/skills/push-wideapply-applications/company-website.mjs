// company-website.mjs
//
// Cleans a provider's company website value before it goes in the application payload. ElasticDash-BE rejects a
// malformed companyWebsite with a 400, which would fail the whole application, so anything that is not a plausible
// company site is dropped here instead (the admin can still enter it in the dashboard).

const NOT_A_COMPANY_SITE = [
    'linkedin.com', 'wellfound.com', 'angel.co', 'builtin.com', 'glassdoor.com', 'indeed.com', 'ziprecruiter.com',
    'crunchbase.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'youtube.com', 'github.com',
    'greenhouse.io', 'ashbyhq.com', 'lever.co', 'myworkdayjobs.com', 'smartrecruiters.com', 'icims.com',
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'
];

/** Returns "https://host" for a plausible company site, or null. Never throws. */
export function cleanCompanyWebsite(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    let url;
    try {
        url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
        return null;
    }
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    if (!host.includes('.') || host === 'localhost' || /^[\d.]+$/.test(host) || host.includes(':')) return null;
    const bare = host.replace(/^www\./, '');
    if (NOT_A_COMPANY_SITE.some((d) => bare === d || bare.endsWith(`.${d}`))) return null;
    return `https://${host}`;
}

/** Applications that still have no usable companyWebsite after cleaning, as { index, company, jobPostUrl }. */
export function applicationsWithoutWebsite(applications) {
    return (applications || [])
        .map((app, index) => ({ index, company: app?.company, jobPostUrl: app?.jobPostUrl, has: Boolean(app?.companyWebsite) }))
        .filter((a) => !a.has)
        .map(({ index, company, jobPostUrl }) => ({ index, company, jobPostUrl }));
}
