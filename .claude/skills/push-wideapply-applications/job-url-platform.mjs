// job-url-platform.mjs
//
// Classifies an application's jobPostUrl so a job left on a job board is never silent. Auto-apply can only drive the
// employer's own ATS; a board URL shows up as an unknown platform and cannot be applied to.
//   'employer_ats'  a known ATS host (Greenhouse, Ashby, Lever, Workday, SmartRecruiters, iCIMS...) -> { platform }
//   'board'         a job board or aggregator -> { platform }; Built In is flagged `refuse` (never logged, user directive 2026-11-01)
//   'unknown'       anything else (an employer's own careers site, or a URL that does not parse)

const BOARDS = [
    ['builtin', 'Built In'], ['linkedin.com', 'LinkedIn'], ['wellfound.com', 'Wellfound'], ['angel.co', 'Wellfound'],
    ['indeed.com', 'Indeed'], ['glassdoor.com', 'Glassdoor'], ['ziprecruiter.com', 'ZipRecruiter'],
    ['startup.jobs', 'startup.jobs'], ['simplyhired.com', 'SimplyHired'], ['monster.com', 'Monster'],
    ['dice.com', 'Dice'], ['otta.com', 'Otta'], ['welcometothejungle.com', 'Welcome to the Jungle'],
    ['ycombinator.com', 'Work at a Startup'], ['remoteok.com', 'RemoteOK'], ['weworkremotely.com', 'We Work Remotely'],
    ['themuse.com', 'The Muse'], ['levels.fyi', 'Levels.fyi']
];

const ATS = [
    ['greenhouse.io', 'Greenhouse'], ['ashbyhq.com', 'Ashby'], ['lever.co', 'Lever'], ['myworkdayjobs.com', 'Workday'],
    ['myworkdaysite.com', 'Workday'], ['smartrecruiters.com', 'SmartRecruiters'], ['icims.com', 'iCIMS'],
    ['taleo.net', 'Taleo'], ['jobvite.com', 'Jobvite'], ['workable.com', 'Workable'], ['bamboohr.com', 'BambooHR'],
    ['recruitee.com', 'Recruitee'], ['successfactors', 'SuccessFactors']
];

// Built In has one host per city: builtin.com, builtinnyc.com, builtinsf.com... Matched on the registrable label only.
const isBuiltInHost = (host) => /(^|\.)builtin[a-z]*\.com$/.test(host);

export function classifyJobUrl(value) {
    let host;
    try {
        host = new URL(String(value ?? '').trim()).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
        return { kind: 'unknown' };
    }
    if (!host) return { kind: 'unknown' };
    if (isBuiltInHost(host)) return { kind: 'board', platform: 'Built In', refuse: true };
    const board = BOARDS.find(([d]) => d !== 'builtin' && (host === d || host.endsWith(`.${d}`)));
    if (board) return { kind: 'board', platform: board[1], refuse: false };
    const ats = ATS.find(([d]) => host.includes(d));
    if (ats) return { kind: 'employer_ats', platform: ats[1] };
    return { kind: 'unknown' };
}

/**
 * Splits applications by where their jobPostUrl points.
 * -> { refused: [{ index, company, role, platform, url }], onBoard: [same], counts: { employerAts, board, unknown } }
 * `refused` (Built In) must not be pushed; `onBoard` may be, but is reported.
 */
export function reviewJobUrls(applications) {
    const refused = [];
    const onBoard = [];
    const counts = { employerAts: 0, board: 0, unknown: 0 };
    (applications || []).forEach((app, index) => {
        const c = classifyJobUrl(app?.jobPostUrl);
        if (c.kind === 'employer_ats') counts.employerAts += 1;
        else if (c.kind === 'unknown') counts.unknown += 1;
        else {
            counts.board += 1;
            const row = { index, company: app?.company, role: app?.role, platform: c.platform, url: app?.jobPostUrl };
            (c.refuse ? refused : onBoard).push(row);
        }
    });
    return { refused, onBoard, counts };
}
