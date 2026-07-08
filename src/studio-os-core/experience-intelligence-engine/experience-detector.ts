import { CREATIVE_DIRECTOR_QUESTIONS, FORBIDDEN_FLAT_EXPERIENCE_PATTERNS } from './laws';
import type { ExperienceIssue } from './types';
import type { MigrationAuditRow } from '../studio-world/migration-audit';

function uid(): string {
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function failedQuestions(patterns: string[]): string[] {
  const failed: string[] = [];
  if (patterns.some((p) => p.includes('scroll') || p.includes('dashboard'))) {
    failed.push(CREATIVE_DIRECTOR_QUESTIONS[3], CREATIVE_DIRECTOR_QUESTIONS[10]);
  }
  if (patterns.some((p) => p.includes('static') || p.includes('no movement'))) {
    failed.push(CREATIVE_DIRECTOR_QUESTIONS[8], CREATIVE_DIRECTOR_QUESTIONS[1]);
  }
  if (patterns.some((p) => p.includes('generic') || p.includes('template'))) {
    failed.push(CREATIVE_DIRECTOR_QUESTIONS[6], CREATIVE_DIRECTOR_QUESTIONS[11]);
  }
  if (patterns.some((p) => p.includes('no discovery') || p.includes('no landmark'))) {
    failed.push(CREATIVE_DIRECTOR_QUESTIONS[4], CREATIVE_DIRECTOR_QUESTIONS[2]);
  }
  return [...new Set(failed)];
}

export function detectExperienceIssues(rows: MigrationAuditRow[]): ExperienceIssue[] {
  const issues: ExperienceIssue[] = [];

  for (const row of rows) {
    const patterns: string[] = [];

    if (row.currentUiPattern === 'scrollable-admin-stage') {
      patterns.push('too much ui', 'scrollable admin stage', 'generic', 'static', 'no movement', 'no discovery');
    }
    if (row.currentUiPattern === 'immersive-partial-dashboard') {
      patterns.push('too much ui', 'dashboard hybrid', 'kpi metric grid', 'no emotional payoff');
    }
    if (row.flaggedAsWebpage) {
      patterns.push('template-like', 'flat', 'too many panels');
    }
    if (row.estimatedReusePct < 30) {
      patterns.push('repetitive', 'generic');
    }

    if (patterns.length === 0 && row.currentUiPattern === 'immersive-live') continue;

    const matched = FORBIDDEN_FLAT_EXPERIENCE_PATTERNS.filter((p) =>
      patterns.some((pat) => pat.includes(p) || p.includes(pat.replace(/-/g, ' ')))
    );

    if (matched.length === 0 && row.currentUiPattern !== 'immersive-live') {
      patterns.push('flat');
    }

    issues.push({
      id: uid(),
      category: row.currentUiPattern === 'scrollable-admin-stage' ? 'ui-heavy' : 'flat-experience',
      severity: row.migrationPriority === 'P0' ? 'critical' : row.currentUiPattern === 'immersive-live' ? 'minor' : 'major',
      problem: `Experience feels software-like, not magical: ${row.room}`,
      reason: `Creative Director flags: ${[...new Set([...patterns, ...matched])].slice(0, 5).join(', ')}`,
      affectedDestinations: [row.currentRoute],
      creativeQuestionsFailed: failedQuestions(patterns),
    });
  }

  return issues;
}
