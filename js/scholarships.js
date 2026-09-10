/**
 * ARVENAIRE scholarship status data
 * Reviewed against official sources on 10 September 2026.
 *
 * IMPORTANT: scholarship deadlines are not treated as universal countdowns.
 * Many vary by embassy, university, programme and applicant country. Every record
 * therefore carries an official source and a review date, and the UI tells users
 * to confirm the current call before applying.
 */
(function () {
  'use strict';

  const VERIFIED_ON = '10 September 2026';

  const DATA = Object.freeze({
    japan: Object.freeze({
      programme: 'Japanese Government (MEXT) Scholarship',
      cycle: '2027 Embassy Recommendation — India',
      status: 'closed',
      statusLabel: '2027 India embassy applications closed',
      deadlineLabel: 'Research: 20 April–15 May 2026 · Undergraduate/KOSEN/STC: 23 April–25 May 2026',
      note: 'The Embassy of Japan in India marks these 2027 application windows as closed. University-recommendation routes and later cycles have separate schedules.',
      verifiedOn: VERIFIED_ON,
      sources: Object.freeze([
        Object.freeze({ label: 'Embassy of Japan in India — MEXT scholarships', url: 'https://www.in.emb-japan.go.jp/Education/japanese_government_scholarships.html' }),
        Object.freeze({ label: 'MEXT — 2027 scholarship calls', url: 'https://www.mext.go.jp/a_menu/koutou/ryugaku/06032818.htm' })
      ])
    }),

    korea: Object.freeze({
      programme: 'Global Korea Scholarship (GKS)',
      cycle: '2027 Undergraduate',
      status: 'verify',
      statusLabel: '2027 undergraduate guidelines published',
      deadlineLabel: 'Deadline depends on track and first-round institution; check the current guideline and India notice before submission.',
      note: 'Study in Korea published the 2027 GKS-U guidelines on 9 September 2026. The official notice directs applicants to the attached guideline for deadlines and procedures. India-specific first-round instructions should be confirmed with the Korean Education Centre / Embassy notice.',
      verifiedOn: VERIFIED_ON,
      sources: Object.freeze([
        Object.freeze({ label: 'Study in Korea — 2027 GKS-U notice', url: 'https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522' }),
        Object.freeze({ label: 'Embassy of the Republic of Korea in India — News', url: 'https://overseas.mofa.go.kr/in-en/brd/m_22090/list.do' })
      ])
    }),

    germany: Object.freeze({
      programme: 'DAAD Scholarships',
      cycle: '2026/27 calls',
      status: 'variable',
      statusLabel: 'Programme-specific deadlines',
      deadlineLabel: 'There is no single DAAD deadline. Dates vary by scholarship, applicant country and programme.',
      note: 'DAAD states that application deadlines are updated annually and publishes current dates in its scholarship database. ARVENAIRE therefore does not show a universal countdown for Germany.',
      verifiedOn: VERIFIED_ON,
      sources: Object.freeze([
        Object.freeze({ label: 'DAAD Scholarship Database', url: 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/' }),
        Object.freeze({ label: 'DAAD EPOS information', url: 'https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/' })
      ])
    })
  });

  window.ARVENAIRE = window.ARVENAIRE || {};
  window.ARVENAIRE.scholarships = DATA;
})();
