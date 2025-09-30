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

type AboutData = {
  title: string;
  html: string;
};

type AboutPageProps = {
  aboutData: AboutData;
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
              <Text color='blue.600' fontWeight='500'>
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

function ContactCard() {
  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={4}
      borderRadius='2xl'
      mb={4}
    >
      <Heading size='sm' mb={3} color='gray.800'>
        Contact
      </Heading>
      <Box display='flex' flexDirection='column' gap={2}>
        <Box as='a' href='mailto:nick@karnik.io'>
          <Box
            display='flex'
            alignItems='center'
            gap={2}
            px={4}
            py={2}
            bg='blue.600'
            color='white'
            borderRadius='md'
            _hover={{ bg: 'blue.700' }}
          >
            📧 Email
          </Box>
        </Box>
        <Box
          as='a'
          href='https://www.linkedin.com/in/theoutlander'
          target='_blank'
        >
          <Box
            display='flex'
            alignItems='center'
            gap={2}
            px={4}
            py={2}
            border='1px solid'
            borderColor='gray.200'
            borderRadius='md'
            _hover={{ bg: 'gray.50' }}
          >
            LinkedIn 🔗
          </Box>
        </Box>
        <Box as='a' href='https://github.com/theoutlander' target='_blank'>
          <Box
            display='flex'
            alignItems='center'
            gap={2}
            px={4}
            py={2}
            border='1px solid'
            borderColor='gray.200'
            borderRadius='md'
            _hover={{ bg: 'gray.50' }}
          >
            GitHub 🔗
          </Box>
        </Box>
        <Box as='a' href='/resume'>
          <Box
            display='flex'
            alignItems='center'
            gap={2}
            px={4}
            py={2}
            border='1px solid'
            borderColor='blue.600'
            color='blue.600'
            borderRadius='md'
            _hover={{ bg: 'blue.50' }}
          >
            📄 Resume
          </Box>
        </Box>
      </Box>
    </Card.Root>
  );
}

function FocusCard() {
  const technologies = [
    'TypeScript',
    'React',
    'Vite',
    'Chakra',
    'Node',
    'GraphQL',
    'AI',
  ];

  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={4}
      borderRadius='2xl'
      mb={4}
    >
      <Heading size='sm' mb={3} color='gray.800'>
        Focus
      </Heading>
      <Box display='flex' flexWrap='wrap' gap={2} mb={3}>
        {technologies.map(tech => (
          <Badge key={tech} colorPalette='gray' variant='subtle' size='sm'>
            {tech}
          </Badge>
        ))}
      </Box>
      <Box borderTop='1px solid' borderColor='gray.200' pt={3}>
        <Text fontSize='sm' color='gray.600' lineHeight={1.5}>
          I help teams move faster with clear product bets, strong execution,
          and systems that are simple to maintain.
        </Text>
      </Box>
    </Card.Root>
  );
}

function CurrentlyCard() {
  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={4}
      borderRadius='2xl'
    >
      <Heading size='sm' mb={3} color='gray.800'>
        Currently
      </Heading>
      <Box display='flex' flexDirection='column' gap={2}>
        <Text fontSize='sm' color='gray.800'>
          Advising founders on pragmatic AI and DX.
        </Text>
        <Text fontSize='sm' color='gray.800'>
          Building with React + Node, shipping weekly.
        </Text>
      </Box>
    </Card.Root>
  );
}

export function AboutPage({ aboutData }: AboutPageProps) {
  return (
    <Box bg='gray.50' minH='100vh'>
      <Header />
      <Container as='main' maxW='6xl' py={{ base: 6, md: 10 }}>
        {/* Hero */}
        <Flex align='center' gap={6} mb={10}>
          <Box
            width='16'
            height='16'
            borderRadius='50%'
            bg='blue.600'
            display='flex'
            alignItems='center'
            justifyContent='center'
            color='white'
            fontWeight='bold'
            fontSize='2xl'
          >
            NK
          </Box>
          <Box>
            <Heading size='3xl' mb={2} color='gray.800'>
              Nick Karnik
            </Heading>
            <Text color='gray.600' mb={2}>
              Engineering Leader & Staff Software Engineer, shipping fast with
              Node, React, and TypeScript
            </Text>
            <HStack gap={2} wrap='wrap'>
              {['TypeScript', 'React', 'DX'].map(tech => (
                <Badge
                  key={tech}
                  colorPalette='gray'
                  variant='subtle'
                  size='sm'
                >
                  {tech}
                </Badge>
              ))}
            </HStack>
          </Box>
        </Flex>

        {/* Layout */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
          {/* Main content */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <Heading size='lg' mb={3} color='gray.800'>
              About
            </Heading>
            <Box
              lineHeight={1.8}
              dangerouslySetInnerHTML={{ __html: aboutData.html }}
            />
          </Box>

          {/* Sidebar */}
          <Box>
            <ContactCard />
            <FocusCard />
            <CurrentlyCard />
          </Box>
        </SimpleGrid>
      </Container>
      <Footer />
    </Box>
  );
}
