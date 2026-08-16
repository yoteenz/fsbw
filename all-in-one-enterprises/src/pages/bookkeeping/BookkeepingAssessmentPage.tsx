import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AIOButton } from '../../components/AIOButton';
import type {
  BookkeepingAssessmentAnswers,
  BookkeepingBillingInterval,
  BooksCurrentness,
  DriverStructure,
  MonthlyTransactionBand,
} from '../../bookkeeping/bookkeepingTypes';
import {
  BOOKKEEPING_ASSESSMENT_STORAGE_KEY,
} from '../../bookkeeping/bookkeepingConfig';
import {
  loadAssessmentFromSession,
  saveAssessmentToSession,
} from '../../demo/bookkeepingActions';
import { aioPaths } from '../../utils/paths';

const STEPS = [
  {
    id: 'fleet',
    title: 'Your operation',
    fields: ['truckCount', 'bankAccountCount', 'creditCardCount', 'monthlyTransactionBand'] as const,
  },
  {
    id: 'services',
    title: 'Financial needs',
    fields: [
      'factoringUsed',
      'driverStructure',
      'needsDriverSettlements',
      'needsAr',
      'needsAp',
      'needsPayrollReconciliation',
    ] as const,
  },
  {
    id: 'reporting',
    title: 'Reporting & support',
    fields: ['needsIftaSupport', 'needsTruckProfitability', 'wantsMonthlyReview', 'booksCurrentness'] as const,
  },
] as const;

const defaultAnswers: BookkeepingAssessmentAnswers = {
  truckCount: 1,
  bankAccountCount: 1,
  creditCardCount: 1,
  monthlyTransactionBand: 'under_50',
  factoringUsed: false,
  driverStructure: 'none',
  needsDriverSettlements: false,
  needsAr: false,
  needsAp: false,
  needsPayrollReconciliation: false,
  needsIftaSupport: false,
  needsTruckProfitability: false,
  wantsMonthlyReview: false,
  booksCurrentness: 'current',
};

export function BookkeepingAssessmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [interval, setInterval] = useState<BookkeepingBillingInterval>('MONTHLY');
  const [answers, setAnswers] = useState<BookkeepingAssessmentAnswers>(() => {
    if (typeof window === 'undefined') return defaultAnswers;
    const saved = loadAssessmentFromSession();
    return saved ?? defaultAnswers;
  });

  useEffect(() => {
    document.title = 'Bookkeeping Assessment | All In One Enterprises Inc.';
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(BOOKKEEPING_ASSESSMENT_STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  function update<K extends keyof BookkeepingAssessmentAnswers>(key: K, value: BookkeepingAssessmentAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function finish() {
    saveAssessmentToSession({ ...answers, completedAt: new Date().toISOString() }, interval);
    navigate(aioPaths.bookkeepingRecommendation);
  }

  const current = STEPS[step];

  return (
    <div className="aio-page aio-bk-assessment">
      <div className="aio-container aio-bk-assessment__inner">
        <Link to={aioPaths.bookkeeping} className="aio-office-link">← Bookkeeping</Link>
        <h1 className="aio-display-md">Get My Recommendation</h1>
        <p className="aio-body">Short questionnaire — transparent rules, not a black-box AI.</p>

        <div className="aio-bk-assessment__progress" aria-hidden="true">
          <div className="aio-bk-assessment__progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="aio-bk-assessment__step-label">
          Step {step + 1} of {STEPS.length} · {current.title}
        </p>

        <div className="aio-bk-assessment__billing-pref">
          <span>Preferred billing:</span>
          <button
            type="button"
            className={interval === 'MONTHLY' ? 'is-active' : ''}
            onClick={() => setInterval('MONTHLY')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={interval === 'ANNUAL' ? 'is-active' : ''}
            onClick={() => setInterval('ANNUAL')}
          >
            Annual
          </button>
        </div>

        <div className="aio-bk-assessment__form">
          {step === 0 && (
            <>
              <label className="aio-bk-field">
                <span>How many trucks do you currently operate?</span>
                <select
                  value={answers.truckCount}
                  onChange={(e) => update('truckCount', Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>{n}{n >= 20 ? '+' : ''}</option>
                  ))}
                </select>
              </label>
              <label className="aio-bk-field">
                <span>How many business bank accounts?</span>
                <select
                  value={answers.bankAccountCount}
                  onChange={(e) => update('bankAccountCount', Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}{n >= 6 ? '+' : ''}</option>
                  ))}
                </select>
              </label>
              <label className="aio-bk-field">
                <span>How many business credit-card accounts?</span>
                <select
                  value={answers.creditCardCount}
                  onChange={(e) => update('creditCardCount', Number(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}{n >= 5 ? '+' : ''}</option>
                  ))}
                </select>
              </label>
              <label className="aio-bk-field">
                <span>Approximate monthly transactions</span>
                <select
                  value={answers.monthlyTransactionBand}
                  onChange={(e) => update('monthlyTransactionBand', e.target.value as MonthlyTransactionBand)}
                >
                  <option value="under_50">Under 50</option>
                  <option value="50_150">50 – 150</option>
                  <option value="150_400">150 – 400</option>
                  <option value="400_plus">400+</option>
                </select>
              </label>
            </>
          )}

          {step === 1 && (
            <>
              <fieldset className="aio-bk-field">
                <legend>Do you use factoring?</legend>
                <label><input type="radio" checked={!answers.factoringUsed} onChange={() => update('factoringUsed', false)} /> No</label>
                <label><input type="radio" checked={answers.factoringUsed} onChange={() => update('factoringUsed', true)} /> Yes</label>
              </fieldset>
              <label className="aio-bk-field">
                <span>Drivers / contractors</span>
                <select
                  value={answers.driverStructure}
                  onChange={(e) => update('driverStructure', e.target.value as DriverStructure)}
                >
                  <option value="none">Owner-operator only</option>
                  <option value="company_drivers">Company drivers</option>
                  <option value="contractors">Contractors</option>
                  <option value="both">Both</option>
                </select>
              </label>
              {[
                ['needsDriverSettlements', 'Driver-settlement tracking'],
                ['needsAr', 'Accounts Receivable tracking'],
                ['needsAp', 'Accounts Payable tracking'],
                ['needsPayrollReconciliation', 'Payroll bookkeeping/reconciliation'],
              ].map(([key, label]) => (
                <label key={key} className="aio-bk-field aio-bk-field--check">
                  <input
                    type="checkbox"
                    checked={answers[key as keyof BookkeepingAssessmentAnswers] as boolean}
                    onChange={(e) => update(key as keyof BookkeepingAssessmentAnswers, e.target.checked as never)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </>
          )}

          {step === 2 && (
            <>
              {[
                ['needsIftaSupport', 'IFTA bookkeeping support'],
                ['needsTruckProfitability', 'Truck-by-truck profitability'],
                ['wantsMonthlyReview', 'Monthly financial review meetings'],
              ].map(([key, label]) => (
                <label key={key} className="aio-bk-field aio-bk-field--check">
                  <input
                    type="checkbox"
                    checked={answers[key as keyof BookkeepingAssessmentAnswers] as boolean}
                    onChange={(e) => update(key as keyof BookkeepingAssessmentAnswers, e.target.checked as never)}
                  />
                  <span>{label}</span>
                </label>
              ))}
              <label className="aio-bk-field">
                <span>How current are your books?</span>
                <select
                  value={answers.booksCurrentness}
                  onChange={(e) => update('booksCurrentness', e.target.value as BooksCurrentness)}
                >
                  <option value="current">Current</option>
                  <option value="1_2_months">1–2 months behind</option>
                  <option value="3_6_months">3–6 months behind</option>
                  <option value="7_12_months">7–12 months behind</option>
                  <option value="more_than_12">More than 12 months behind</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </label>
            </>
          )}
        </div>

        <div className="aio-bk-assessment__nav">
          {step > 0 && (
            <AIOButton variant="outline" type="button" onClick={() => setStep((s) => s - 1)}>
              Back
            </AIOButton>
          )}
          {step < STEPS.length - 1 ? (
            <AIOButton variant="gold" type="button" onClick={() => setStep((s) => s + 1)}>
              Continue
            </AIOButton>
          ) : (
            <AIOButton variant="gold" type="button" onClick={finish}>
              See Recommendation
            </AIOButton>
          )}
        </div>
      </div>
    </div>
  );
}
