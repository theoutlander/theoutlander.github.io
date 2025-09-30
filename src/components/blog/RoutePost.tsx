import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Image,
  Text,
  HStack,
  Tag,
  Container,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import ProgressTop from '../ui/ProgressTop';
import PostJsonLd from '../seo/PostJsonLd';

export type Post = {
  slug: string;
  title: string;
  url: string;
  date?: string | null;
  excerpt?: string;
  cover?: string | null;
  tags?: string[];
  contentMarkdown?: string;
  contentHtml?: string;
};

export default function RoutePost({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch('/data/hashnode.json')
      .then(r => r.json())
      .then((all: Post[]) => setPost(all.find(p => p.slug === slug) ?? null))
      .catch(() => setPost(null));
  }, [slug]);

  if (!post) return <Box>Loading…</Box>;

  return (
    <>
      <ProgressTop />
      {/* SEO basics for prerendered HTML */}
      <head>
        <title>{post.title}</title>
        <link
          rel='canonical'
          href={`https://nick.karnik.io/blog/${post.slug}`}
        />
        {post.excerpt ? (
          <meta name='description' content={post.excerpt} />
        ) : null}
        {post.cover ? <meta property='og:image' content={post.cover} /> : null}
      </head>

      {/* Structured data */}
      <PostJsonLd
        title={post.title}
        url={`https://nick.karnik.io/blog/${post.slug}`}
        date={post.date}
        excerpt={post.excerpt}
      />

      <Container maxW='3xl' px={6}>
        {post.cover ? (
          <Image src={post.cover} alt='' mb={8} borderRadius='xl' w='full' />
        ) : null}

        <Heading size='xl' mb={4} lineHeight='1.2'>
          {post.title}
        </Heading>

        <HStack gap={3} mb={6}>
          <Text fontSize='sm' color='gray.600'>
            {post.date ? new Date(post.date).toDateString() : ''}
          </Text>
          {post.tags?.slice(0, 4).map(t => (
            <Tag.Root key={t} size='sm' variant='subtle'>
              {t}
            </Tag.Root>
          ))}
        </HStack>

        <Text color='gray.800' mb={8} fontSize='lg' lineHeight='1.7'>
          {post.excerpt}
        </Text>

        {/* Full article content */}
        <Box maxW='none' lineHeight='1.7' fontSize='lg' color='gray.800'>
          {post.contentMarkdown ? (
            <ReactMarkdown>{post.contentMarkdown}</ReactMarkdown>
          ) : post.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          ) : (
            <Text color='gray.500' fontStyle='italic'>
              Content not available
            </Text>
          )}
        </Box>
      </Container>
    </>
  );
}
