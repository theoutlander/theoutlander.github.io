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
  Badge,
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

type HomePageProps = {
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
              <Text color='gray.600' _hover={{ color: 'blue.600' }}>
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

function HeroSection() {
  return (
    <Box
      py={16}
      bg='linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      borderRadius='2xl'
      mb={16}
      position='relative'
      overflow='hidden'
    >
      <Box
        position='absolute'
        top='-50%'
        right='-20%'
        width='300px'
        height='300px'
        bg='blue.100'
        borderRadius='50%'
        opacity={0.3}
      />
      <Box
        position='absolute'
        bottom='-30%'
        left='-10%'
        width='200px'
        height='200px'
        bg='purple.100'
        borderRadius='50%'
        opacity={0.2}
      />

      <Container maxW='6xl' px={6} position='relative'>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={12} align='center'>
          <Box>
            <Heading size='4xl' mb={4} color='gray.800'>
              Hi, I'm Nick Karnik
            </Heading>
            <Text fontSize='xl' color='gray.600' mb={6} lineHeight={1.6}>
              Engineer and EM, shipping fast with TypeScript. I help teams move
              faster with clear product bets, strong execution, and systems that
              are simple to maintain.
            </Text>
            <HStack gap={3} mb={6} wrap='wrap'>
              {['TypeScript', 'React', 'DX', 'AI'].map(tag => (
                <Badge key={tag} colorPalette='blue' size='lg' px={4} py={2}>
                  {tag}
                </Badge>
              ))}
            </HStack>
            <HStack gap={4} wrap='wrap'>
              <Box as='a' href='/blog'>
                <Box
                  as='button'
                  bg='blue.600'
                  color='white'
                  px={6}
                  py={3}
                  borderRadius='md'
                  fontWeight='500'
                  _hover={{ bg: 'blue.700' }}
                  boxShadow='0 4px 6px rgba(0,0,0,0.1)'
                >
                  Read My Blog →
                </Box>
              </Box>
              <Box as='a' href='/about'>
                <Box
                  as='button'
                  border='1px solid'
                  borderColor='gray.200'
                  color='gray.800'
                  px={6}
                  py={3}
                  borderRadius='md'
                  fontWeight='500'
                  _hover={{ bg: 'gray.50' }}
                  boxShadow='0 1px 3px rgba(0,0,0,0.1)'
                >
                  About Me
                </Box>
              </Box>
            </HStack>
          </Box>
          <Box textAlign='center'>
            <Box
              width='32'
              height='32'
              borderRadius='50%'
              bg='blue.600'
              display='flex'
              alignItems='center'
              justifyContent='center'
              color='white'
              fontSize='4xl'
              fontWeight='bold'
              mx='auto'
              mb={6}
              boxShadow='0 8px 25px rgba(0,0,0,0.15)'
              border='4px solid white'
            >
              NK
            </Box>
            <Text fontSize='lg' color='gray.600' fontWeight='500'>
              Currently: Advising founders on pragmatic AI and DX
            </Text>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

function StatsSection() {
  const stats = [
    {
      label: 'Years Experience',
      value: '8+',
      description: 'Engineering & Leadership',
      color: 'blue.600',
    },
    {
      label: 'Technologies',
      value: '15+',
      description: 'TypeScript, React, Node, AI',
      color: 'green.600',
    },
    {
      label: 'Teams Led',
      value: '5+',
      description: 'Engineering Teams',
      color: 'purple.600',
    },
  ];

  return (
    <Box mb={16}>
      <Heading size='3xl' textAlign='center' mb={10} color='gray.800'>
        Professional Experience
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
        {stats.map((stat, index) => (
          <Card.Root
            key={index}
            border='1px solid'
            borderColor='gray.200'
            p={8}
            borderRadius='2xl'
            textAlign='center'
          >
            <Text fontSize='sm' color='gray.600' mb={2} fontWeight='500'>
              {stat.label}
            </Text>
            <Heading size='3xl' color={stat.color} mb={1}>
              {stat.value}
            </Heading>
            <Text fontSize='sm' color='gray.600'>
              {stat.description}
            </Text>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Box>
  );
}

function LatestPostsSection({ posts }: { posts: Post[] }) {
  const latestPosts = posts.slice(0, 2);

  return (
    <Box mb={16}>
      <Box textAlign='center' mb={10}>
        <Heading size='3xl' mb={3} color='gray.800'>
          Latest Thoughts
        </Heading>
        <Text fontSize='lg' color='gray.600' maxW='600px' mx='auto'>
          Sharing insights on engineering, AI, and technology from my experience
          building and leading teams.
        </Text>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
        {latestPosts.map(post => (
          <Card.Root
            key={post.slug}
            borderRadius='2xl'
            overflow='hidden'
            boxShadow='0 1px 3px rgba(0,0,0,0.1)'
            border='1px solid'
            borderColor='gray.200'
          >
            <Card.Body p={8}>
              <Box as='a' href={`/blog/${post.slug}`}>
                <Heading
                  size='lg'
                  color='blue.600'
                  mb={3}
                  _hover={{ color: 'blue.700' }}
                >
                  {post.title}
                </Heading>
              </Box>
              <HStack gap={2} mb={4}>
                <Text fontSize='sm' color='gray.600' fontWeight='500'>
                  {post.date
                    ? new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </Text>
                <Text color='gray.300'>•</Text>
                <Text fontSize='sm' color='gray.600'>
                  {Math.max(
                    1,
                    Math.round(post.excerpt.split(' ').length / 200)
                  )}{' '}
                  min read
                </Text>
              </HStack>
              {post.excerpt && (
                <Text color='gray.800' fontSize='md' lineHeight={1.6}>
                  {post.excerpt}
                </Text>
              )}
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
      <Box textAlign='center' mt={8}>
        <Box as='a' href='/blog'>
          <Box
            as='button'
            border='1px solid'
            borderColor='gray.200'
            color='gray.800'
            px={6}
            py={3}
            borderRadius='md'
            fontWeight='500'
            _hover={{ bg: 'gray.50' }}
          >
            View All Posts →
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function HomePage({ posts }: HomePageProps) {
  return (
    <Box bg='gray.50' minH='100vh'>
      <Header />
      <Container as='main' maxW='6xl' py={{ base: 6, md: 10 }}>
        <HeroSection />
        <StatsSection />
        <LatestPostsSection posts={posts} />
      </Container>
      <Footer />
    </Box>
  );
}
