import React from 'react';
// import { Helmet } from 'react-helmet-async';
import {
  Box,
  Container,
  Flex,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
} from '@chakra-ui/react';
// import { Link } from '@tanstack/react-router';

type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
  cover: string;
  tags: string[];
};

type BlogPageProps = {
  posts: Post[];
};

function Header() {
  const BRAND = 'Nick Karnik';

  return (
    <Box
      as='header'
      position='sticky'
      top={0}
      zIndex={10}
      bg='white'
      borderBottom='1px solid'
      borderColor='gray.200'
      backdropFilter='saturate(180%) blur(8px)'
    >
      <Container maxW='6xl' py={3}>
        <Flex align='center' justify='space-between' gap={6}>
          <Box as='a' href='/'>
            <Heading size='md' color='gray.800'>
              {BRAND}
            </Heading>
          </Box>

          <HStack gap={6}>
            <Box as='a' href='/blog'>
              <Text color='blue.600' fontWeight='500'>
                Blog
              </Text>
            </Box>
            <Box as='a' href='/about'>
              <Text color='gray.600' _hover={{ color: 'blue.600' }}>
                About
              </Text>
            </Box>
            <Box as='a' href='/resume'>
              <Text color='gray.600' _hover={{ color: 'blue.600' }}>
                Resume
              </Text>
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box
      as='footer'
      bg='white'
      borderTop='1px solid'
      borderColor='gray.200'
      py={8}
      mt={16}
    >
      <Container maxW='6xl'>
        <Flex align='center' justify='space-between'>
          <Text fontSize='sm' color='gray.600'>
            © 2024 Nick Karnik. All rights reserved.
          </Text>
          <HStack gap={4}>
            <Box as='a' href='https://github.com/theoutlander' target='_blank'>
              <Text
                fontSize='sm'
                color='gray.600'
                _hover={{ color: 'blue.600' }}
              >
                GitHub
              </Text>
            </Box>
            <Box
              as='a'
              href='https://www.linkedin.com/in/theoutlander'
              target='_blank'
            >
              <Text
                fontSize='sm'
                color='gray.600'
                _hover={{ color: 'blue.600' }}
              >
                LinkedIn
              </Text>
            </Box>
            <Box as='a' href='mailto:nick@karnik.io'>
              <Text
                fontSize='sm'
                color='gray.600'
                _hover={{ color: 'blue.600' }}
              >
                Email
              </Text>
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

function BlogCard({ post }: { post: Post }) {
  return (
    <Card.Root
      borderRadius='2xl'
      overflow='hidden'
      boxShadow='0 1px 3px rgba(0,0,0,0.1)'
      border='1px solid'
      borderColor='gray.200'
    >
      {post.cover && (
        <Box>
          <Box
            as='img'
            src={post.cover}
            alt=''
            objectFit='cover'
            maxHeight='260px'
            width='100%'
          />
        </Box>
      )}
      <Card.Body p={4}>
        <Box as='a' href={`/blog/${post.slug}`}>
          <Heading
            size='md'
            color='blue.600'
            mb={1}
            _hover={{ color: 'blue.700' }}
          >
            {post.title}
          </Heading>
        </Box>
        <Text fontSize='sm' color='gray.600' mb={3}>
          {post.date ? new Date(post.date).toDateString() : ''}
          {post.excerpt
            ? ` · ${Math.max(1, Math.round(post.excerpt.split(' ').length / 200))} min read`
            : ''}
        </Text>
        {post.excerpt && (
          <Text color='gray.800' lineHeight={1.6}>
            {post.excerpt}
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}

export function BlogPage({ posts }: BlogPageProps) {
  return (
    <Box bg='gray.50' minH='100vh'>
      <Header />
      <Container as='main' maxW='6xl' py={{ base: 6, md: 10 }}>
        <Box mb={12}>
          <Heading size='3xl' mb={4} color='gray.800'>
            Blog
          </Heading>
          <Text fontSize='lg' color='gray.600' maxW='600px'>
            Thoughts on engineering, AI, and technology from my experience
            building and leading teams.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {posts.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </SimpleGrid>
      </Container>
      <Footer />
    </Box>
  );
}
