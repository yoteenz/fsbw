export type TrendReportSectionKind =
  | 'cover'
  | 'what-were-seeing'
  | 'key-takeaways'
  | 'the-movement'
  | 'why-its-happening'
  | 'the-signals'
  | 'whats-peaking'
  | 'whats-cooling'
  | 'the-fs-take'
  | 'try-the-trend'
  | 'what-happens-next'
  | 'related-forecast';

export type TrendReportEditorialSection = {
  id: string;
  kind: TrendReportSectionKind;
  title: string;
  body?: string;
  bullets?: string[];
  pullQuote?: string;
  imageSrc?: string;
  imageAlt?: string;
  signalLabel?: string;
  signalDirection?: string;
  comparison?: {
    leftLabel: string;
    leftImage?: string;
    rightLabel: string;
    rightImage?: string;
  };
};

export type TrendReportEditorial = {
  packId: string;
  seasonLabel: string;
  dek: string;
  readTime: string;
  heroImage: string;
  orbEnabled?: boolean;
  sections: TrendReportEditorialSection[];
  relatedForecastEditionId?: string;
  relatedForecastLabel?: string;
};
