import { scopeStorageKey } from '../workspace/storage';
import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import {
  DEFAULT_DESIGN_DNA,
  DEFAULT_EXPERIENCE_DNA,
  EXPERIENCE_STUDIO_STORAGE_KEY,
  EXPERIENCE_STUDIO_VERSION,
} from './constants';
import type { ExperienceStudioSession, ExperienceTypeId, InterviewStep, StudioPanelId } from './types';

function emptySession(): ExperienceStudioSession {
  return {
    version: EXPERIENCE_STUDIO_VERSION,
    phase: 'entry',
    interviewStep: 'style',
    experienceType: null,
    styleChoice: null,
    audienceChoice: null,
    feelingChoice: null,
    designDna: { ...DEFAULT_DESIGN_DNA },
    experienceDna: { ...DEFAULT_EXPERIENCE_DNA },
    lastRemix: null,
    panelOpen: 'none',
    updatedAt: new Date().toISOString(),
  };
}

function sessionKey(organizationId: string): string {
  return scopeStorageKey(EXPERIENCE_STUDIO_STORAGE_KEY, organizationId);
}

export function readExperienceStudioSession(organizationId: string): ExperienceStudioSession {
  return readStudioOsJson(sessionKey(organizationId), emptySession);
}

export function writeExperienceStudioSession(
  organizationId: string,
  patch: Partial<ExperienceStudioSession>
): ExperienceStudioSession {
  const current = readExperienceStudioSession(organizationId);
  const next: ExperienceStudioSession = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeStudioOsJson(sessionKey(organizationId), next);
  return next;
}

export function selectExperienceType(organizationId: string, experienceType: ExperienceTypeId): ExperienceStudioSession {
  return writeExperienceStudioSession(organizationId, {
    experienceType,
    phase: 'interview',
    interviewStep: 'style',
    panelOpen: 'none',
  });
}

export function advanceInterview(
  organizationId: string,
  step: InterviewStep,
  choice: string
): ExperienceStudioSession {
  if (step === 'style') {
    return writeExperienceStudioSession(organizationId, {
      styleChoice: choice,
      interviewStep: 'audience',
    });
  }
  if (step === 'audience') {
    return writeExperienceStudioSession(organizationId, {
      audienceChoice: choice,
      interviewStep: 'feeling',
    });
  }
  return writeExperienceStudioSession(organizationId, {
    feelingChoice: choice,
    phase: 'builder',
    interviewStep: 'feeling',
    panelOpen: 'none',
  });
}

export function setStudioPanel(organizationId: string, panelOpen: StudioPanelId): ExperienceStudioSession {
  return writeExperienceStudioSession(organizationId, { panelOpen });
}

export function updateDesignDna(organizationId: string, designDna: Record<string, number>): ExperienceStudioSession {
  return writeExperienceStudioSession(organizationId, { designDna });
}

export function updateExperienceDna(
  organizationId: string,
  key: keyof ExperienceStudioSession['experienceDna'],
  value: number
): ExperienceStudioSession {
  const current = readExperienceStudioSession(organizationId);
  return writeExperienceStudioSession(organizationId, {
    experienceDna: { ...current.experienceDna, [key]: value },
  });
}

export function applyRemix(organizationId: string, remix: string): ExperienceStudioSession {
  const current = readExperienceStudioSession(organizationId);
  const designDna = { ...current.designDna };

  const bump = (id: string, amount: number) => {
    designDna[id] = Math.min(100, (designDna[id] ?? 0) + amount);
  };

  const lowerOthers = (keep: string[], totalReduction: number) => {
    const others = Object.keys(designDna).filter((k) => !keep.includes(k));
    const per = others.length ? totalReduction / others.length : 0;
    for (const k of others) designDna[k] = Math.max(0, (designDna[k] ?? 0) - per);
  };

  switch (remix) {
    case 'More Luxury':
      bump('luxury', 12);
      lowerOthers(['luxury'], 12);
      break;
    case 'More Editorial':
      bump('editorial', 12);
      lowerOthers(['editorial'], 12);
      break;
    case 'More Minimal':
      bump('minimal', 12);
      lowerOthers(['minimal'], 12);
      break;
    case 'More Interactive':
    case 'More Gaming':
      bump('interactive', 8);
      bump('gaming', 8);
      lowerOthers(['interactive', 'gaming'], 16);
      break;
    case 'More Organic':
      bump('organic', 12);
      lowerOthers(['organic'], 12);
      break;
    case 'More Corporate':
    case 'More Masculine':
      bump('executive', 10);
      lowerOthers(['executive'], 10);
      break;
    case 'More Feminine':
    case 'More Premium':
      bump('luxury', 8);
      bump('hospitality', 6);
      lowerOthers(['luxury', 'hospitality'], 14);
      break;
    case 'More Dramatic':
      bump('immersive', 12);
      lowerOthers(['immersive'], 12);
      break;
    case 'More Spacious':
      return writeExperienceStudioSession(organizationId, {
        lastRemix: remix,
        experienceDna: { ...current.experienceDna, density: Math.max(10, current.experienceDna.density - 15) },
        designDna,
      });
    case 'More Apple-like':
      bump('minimal', 8);
      bump('glass', 8);
      lowerOthers(['minimal', 'glass'], 16);
      break;
    default:
      bump('modern', 6);
      lowerOthers(['modern'], 6);
  }

  return writeExperienceStudioSession(organizationId, { lastRemix: remix, designDna });
}

export function goBackInterview(organizationId: string): ExperienceStudioSession {
  const current = readExperienceStudioSession(organizationId);
  if (current.interviewStep === 'feeling') {
    return writeExperienceStudioSession(organizationId, { interviewStep: 'audience' });
  }
  if (current.interviewStep === 'audience') {
    return writeExperienceStudioSession(organizationId, { interviewStep: 'style' });
  }
  return writeExperienceStudioSession(organizationId, {
    phase: 'entry',
    experienceType: null,
    styleChoice: null,
    audienceChoice: null,
    feelingChoice: null,
    interviewStep: 'style',
  });
}

export function resetExperienceStudioSession(organizationId: string): ExperienceStudioSession {
  writeStudioOsJson(sessionKey(organizationId), emptySession());
  return emptySession();
}
