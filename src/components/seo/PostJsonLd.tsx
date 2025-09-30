interface PostJsonLdProps {
  title: string;
  url: string;
  date: string;
  excerpt: string;
}

export default function PostJsonLd({
  title,
  url,
  date,
  excerpt,
}: PostJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    url: url,
    datePublished: date,
    description: excerpt,
    author: {
      '@type': 'Person',
      name: 'Nick Karnik',
      url: 'https://nick.karnik.io',
    },
    publisher: {
      '@type': 'Person',
      name: 'Nick Karnik',
      url: 'https://nick.karnik.io',
    },
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
