type Props = {
  invoiceAmount: number;
  sampleFactoringFee: number;
  sampleNetProceeds: number;
};

export function AIOFundingEstimate({ invoiceAmount, sampleFactoringFee, sampleNetProceeds }: Props) {
  return (
    <div className="aio-funding-estimate">
      <div className="aio-funding-estimate__row">
        <span>Invoice Amount</span>
        <strong>${invoiceAmount.toLocaleString()}</strong>
      </div>
      <div className="aio-funding-estimate__row aio-funding-estimate__row--sample">
        <span>
          Potential Factoring Fee <em>(Sample · Illustrative)</em>
        </span>
        <strong>${sampleFactoringFee.toLocaleString()}</strong>
      </div>
      <div className="aio-funding-estimate__row aio-funding-estimate__row--sample">
        <span>
          Estimated Net Proceeds <em>(Sample · Illustrative)</em>
        </span>
        <strong className="aio-gold-text">${sampleNetProceeds.toLocaleString()}</strong>
      </div>
    </div>
  );
}
