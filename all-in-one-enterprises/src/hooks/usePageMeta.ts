import { useEffect } from 'react';

type PageMeta = {
  title: string;
  description?: string;
};

export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      const previousDescription = meta?.getAttribute('content') ?? '';
      meta?.setAttribute('content', description);
      return () => {
        document.title = previousTitle;
        meta?.setAttribute('content', previousDescription);
      };
    }
    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
