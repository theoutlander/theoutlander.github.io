interface PostJsonLdProps {
  title: string;
  url: string;
  date: string;
  excerpt: string;
  image?: string | null;
  dateModified?: string;
}

export default function PostJsonLd({
  title,
  url,
  date,
  excerpt,
  image,
  dateModified,
}: PostJsonLdProps) {
  const siteUrl = "https://nick.karnik.io";
  const defaultImage = `${siteUrl}/assets/images/profile/nick-karnik.jpeg`;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${siteUrl}${image}`
    : defaultImage;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    url: url,
    datePublished: date,
    dateModified: dateModified || date,
    description: excerpt,
    image: imageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: 'Nick Karnik',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nick Karnik',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: defaultImage,
      },
    },
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
