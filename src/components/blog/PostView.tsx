import {
  Box,
  Heading,
  Image,
  Text,
  HStack,
  Tag,
  Container,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import ProgressTop from '../ui/ProgressTop';
import PostJsonLd from '../seo/PostJsonLd';
import { proseStyles } from './PostProse';
import Comments from './Comments';

type Post = {
  id?: string;
  title: string;
  date: string;
  cover: string;
  excerpt: string;
  html: string;
  url: string;
  tags: string[];
};

export default function PostView({ post }: { post: Post }) {
  const postUrl =
    post.url ||
    `https://nick.karnik.io/blog/${post.title
      .toLowerCase()
      .replace(/\s+/g, '-')}`;

  return (
    <>
      <Helmet>
        <title>{post.title}</title>
        <meta name='description' content={post.excerpt || ''} />
        <link
          rel='canonical'
          href={typeof window === 'undefined' ? '' : window.location.href}
        />
        {post.cover ? <meta property='og:image' content={post.cover} /> : null}
        <meta property='og:title' content={post.title} />
        <meta property='og:type' content='article' />
        <meta name='twitter:card' content='summary_large_image' />
      </Helmet>
      <ProgressTop />
      {/* Structured data */}
      <PostJsonLd
        title={post.title}
        url={postUrl}
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
        <Box
          maxW='none'
          lineHeight='1.7'
          fontSize='lg'
          color='gray.800'
          css={proseStyles}
        >
          {post.html ? (
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          ) : (
            <Text color='gray.500' fontStyle='italic'>
              Content not available
            </Text>
          )}
        </Box>

        {/* Comments Section */}
        <Comments postTitle={post.title} postUrl={postUrl} />
      </Container>
    </>
  );
}
