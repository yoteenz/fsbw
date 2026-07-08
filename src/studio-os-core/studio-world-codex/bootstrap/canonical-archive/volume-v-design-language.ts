import type { CanonicalArticleSeed } from '../article-builder';

export const VOLUME_V_DESIGN_ARTICLES: CanonicalArticleSeed[] = [
  {
    articleId: 'ARTICLE-D01',
    title: 'Industrial Design Philosophy™',
    volume: 'volume-v-design-language',
    category: 'Design Canon',
    summary:
      'Studio World design is industrial luxury — precision, material honesty, functional beauty, and collectible object language.',
    philosophy: 'Beauty through function. Reuse before regeneration.',
    guidingPrinciples: [
      'Hero Objects Over Icons™.',
      'Materials have meaning — glass, acrylic, chrome, and light tell stories.',
      'Design DNA Canon governs department golden builds.',
    ],
    relatedSystems: ['Design DNA Canon™', 'Design Genome™', 'Studio Foundry™'],
    relatedArticles: ['ARTICLE-D09', 'ARTICLE-D06'],
    tags: ['design-language', 'industrial', 'philosophy'],
    docPaths: ['docs/frontal-slayer/design-dna-canon/'],
  },
  {
    articleId: 'ARTICLE-D02',
    title: 'Glassmorphism & Optical Acrylic™',
    volume: 'volume-v-design-language',
    category: 'Material Language',
    summary:
      'Glass panels, optical acrylic layers, and depth-through-transparency define Studio World UI surfaces — never flat admin gray.',
    philosophy: 'Surfaces feel physical — light passes through, reflections respond to context.',
    relatedSystems: ['Scene Assembly™', 'Lighting Presets™'],
    relatedArticles: ['ARTICLE-D03', 'ARTICLE-D04'],
    tags: ['design-language', 'glassmorphism', 'acrylic', 'materials'],
  },
  {
    articleId: 'ARTICLE-D03',
    title: 'Chrome, Luxury Materials & Living Interfaces™',
    volume: 'volume-v-design-language',
    category: 'Material Language',
    summary:
      'Chrome accents, luxury material vocabulary, and living interfaces that breathe — subtle motion, ambient state, and material response.',
    philosophy: 'Interfaces are inhabitants of the room — not overlays pasted on top.',
    relatedArticles: ['ARTICLE-D02', 'ARTICLE-K18'],
    tags: ['design-language', 'chrome', 'living-interfaces', 'luxury'],
  },
  {
    articleId: 'ARTICLE-D04',
    title: 'Lighting & Motion Language™',
    volume: 'volume-v-design-language',
    category: 'Motion Canon',
    summary:
      'Lighting presets, cinematic reveals, and motion weight follow Progressive Presence — animation earns its presence.',
    philosophy: 'Motion communicates hierarchy — never decoration without purpose.',
    relatedSystems: ['Lighting Presets™', 'Progressive Presence™', 'Vision Engine™'],
    relatedArticles: ['ARTICLE-K18', 'ARTICLE-D05'],
    tags: ['design-language', 'lighting', 'motion'],
  },
  {
    articleId: 'ARTICLE-D05',
    title: 'Orb & Atlas Behavior Language™',
    volume: 'volume-v-design-language',
    category: 'Interaction Canon',
    summary:
      'Orb behavior: mentoring tone, contextual toolbelt, archival voice. Atlas behavior: spatial orientation, district travel, flagship reveals.',
    philosophy: 'Orb connects relationships. Atlas orients space. Both speak in founder language — not engineering jargon.',
    relatedSystems: ['Orb™', 'Atlas™', 'Hero Objects™'],
    relatedArticles: ['ARTICLE-D09', 'ARTICLE-W05'],
    tags: ['design-language', 'orb', 'atlas', 'behavior'],
    docPaths: ['docs/studio-os/studio-orb.md'],
  },
  {
    articleId: 'ARTICLE-D06',
    title: 'Silhouette Law™',
    volume: 'volume-v-design-language',
    category: 'Hero Object Canon',
    summary:
      'Every Hero Object must be recognizable by silhouette alone — material and edition vary, but the shape is memory.',
    philosophy: 'Silhouette is the citizen\'s spatial memory of a destination.',
    relatedSystems: ['Hero Objects™', 'Studio Foundry™'],
    relatedArticles: ['ARTICLE-D09', 'ARTICLE-D01'],
    tags: ['design-language', 'silhouette-law', 'hero-objects'],
    docPaths: ['docs/studio-os/hero-objects/ARTICLE_D09_HERO_OBJECTS_CONTEXTUAL_ORB.md'],
  },
];
