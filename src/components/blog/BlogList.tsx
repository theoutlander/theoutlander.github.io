import { Box, Text, SimpleGrid, Image, Card } from '@chakra-ui/react';
import { Link as RouterLink } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import type { Post } from './RoutePost';

export default function BlogList({
  posts,
  filterTag,
}: {
  posts: Post[];
  filterTag?: string;
}) {
  const items = posts.filter(p => !filterTag || p.tags?.includes(filterTag));

  return (
    <Box>
      <Helmet>
        <title>Blog - Nick Karnik</title>
        <meta
          name='description'
          content='Read my latest thoughts on software engineering, AI, and technology.'
        />
        <meta property='og:title' content='Blog - Nick Karnik' />
        <meta
          property='og:description'
          content='Read my latest thoughts on software engineering, AI, and technology.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://nick.karnik.io/blog' />
        <meta name='twitter:card' content='summary' />
        <meta name='twitter:title' content='Blog - Nick Karnik' />
        <meta
          name='twitter:description'
          content='Read my latest thoughts on software engineering, AI, and technology.'
        />
      </Helmet>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        {items.map(p => (
          <Card.Root
            key={p.slug}
            borderRadius='2xl'
            overflow='hidden'
            shadow='sm'
            _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
            transition='all 120ms'
          >
            {p.cover ? (
              <Image
                src={p.cover}
                alt=''
                objectFit='cover'
                maxH='260px'
                w='100%'
              />
            ) : null}

            <Box p={4}>
              <RouterLink
                to='/blog/$slug'
                params={{ slug: p.slug }}
                preload='intent'
              >
                <Text
                  as='h2'
                  fontWeight='semibold'
                  fontSize='lg'
                  color='blue.700'
                >
                  {p.title}
                </Text>
              </RouterLink>

              <Text fontSize='sm' color='gray.600' mt={1}>
                {p.date ? new Date(p.date).toDateString() : ''}
                {p.excerpt
                  ? ` · ${estimateReadingTime(p.excerpt)} min read`
                  : ''}
              </Text>

              {p.excerpt ? (
                <Text mt={3} color='gray.800'>
                  {p.excerpt}
                </Text>
              ) : null}
            </Box>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Box>
  );
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
