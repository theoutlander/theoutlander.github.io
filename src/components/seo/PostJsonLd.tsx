export default function PostJsonLd({
  title,
  url,
  date,
  excerpt,
}: {
  title: string;
  url: string;
  date?: string | null;
  excerpt?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    datePublished: date ?? undefined,
    description: excerpt ?? undefined,
    url,
  };
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
