import BrandFaqSection from './BrandFaqSection';
import BrandFaqQuestionSection from './BrandFaqQuestionSection';

type BrandFaqPageContentProps = {
  formId?: string;
  onSubmitted?: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
};

/** FAQ accordion plus client question submission block for `/brand/faq`. */
export default function BrandFaqPageContent({
  formId = 'brand-faq-question-form',
  onSubmitted,
  onSubmittingChange,
}: BrandFaqPageContentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <BrandFaqSection />
      <BrandFaqQuestionSection
        formId={formId}
        onSubmitted={onSubmitted}
        onSubmittingChange={onSubmittingChange}
      />
    </div>
  );
}
