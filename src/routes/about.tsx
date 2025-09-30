import { createFileRoute } from '@tanstack/react-router';
import { AboutPagePanda } from '../pages/AboutPagePanda';
import { useEffect, useState } from 'react';

// Type for the about data
type AboutData = {
  title: string;
  html: string;
};

// Component that handles data loading
function AboutPageWithData() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, try to get data from global window object
    if (
      typeof window !== 'undefined' &&
      (window as any).__INITIAL_ABOUT_DATA__
    ) {
      setAboutData((window as any).__INITIAL_ABOUT_DATA__);
      setLoading(false);
      return;
    }

    // Fallback: fetch data from the JSON file
    fetch('/data/pages/about.json')
      .then(r => r.json())
      .then((data: AboutData) => {
        setAboutData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!aboutData) {
    return <div>Error loading about page</div>;
  }

  return <AboutPagePanda aboutData={aboutData} />;
}

export const Route = createFileRoute('/about')({
  component: AboutPageWithData,
});
