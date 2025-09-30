import React, { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

const FunMessages = [
  'Oops! This page went on a coffee break ☕',
  "Looks like you've wandered into the digital void 🚀",
  'This page is playing hide and seek... and winning! 🎯',
  "The page you're looking for has been abducted by aliens 👽",
  'This page decided to take a vacation to the Bahamas 🏝️',
  'Lost in space, but we found this cool message instead! 🎉',
  'This page is currently attending a virtual conference 📹',
  'The page you seek has been moved to a parallel universe 🌌',
  'Houston, we have a problem... this page is missing! 🛸',
  'This page has gone where no page has gone before! 🌟',
];

export const Route = createFileRoute('/404')({
  component: function NotFoundPage() {
    const [randomMessage, setRandomMessage] = useState(
      'Loading something fun...'
    );

    useEffect(() => {
      const message =
        FunMessages[Math.floor(Math.random() * FunMessages.length)];
      setRandomMessage(message);
    }, []);

    return (
      <>
        <Helmet>
          <title>Lost in Space | Nick Karnik</title>
          <meta
            name='description'
            content="Looks like you've wandered into the digital void! Let's get you back on track."
          />
          <meta name='robots' content='noindex, nofollow' />
        </Helmet>

        {/* Custom styles to match the static design */}
        <style>
          {`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .gradient-text {
              background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
              background-size: 200% 200%;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: gradient 3s ease infinite;
            }
            .glass-button {
              background: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.3);
              transition: all 0.3s ease;
            }
            .glass-button:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            .glass-button-primary {
              background: rgba(255, 255, 255, 0.9);
              color: #333;
            }
            .glass-button-primary:hover {
              background: white;
            }
            .spinner {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 1s ease-in-out infinite;
              margin-right: 8px;
            }
          `}
        </style>

        <Box
          minH='100vh'
          bg='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          display='flex'
          alignItems='center'
          justifyContent='center'
          color='white'
        >
          <Container maxW='600px' textAlign='center' p={8}>
            <VStack gap={6}>
              {/* Rocket and title */}
              <Box>
                <Heading
                  fontSize='8rem'
                  fontWeight='bold'
                  margin={0}
                  className='gradient-text'
                >
                  🚀
                </Heading>
                <Heading
                  fontSize='3rem'
                  fontWeight='bold'
                  margin='0.5rem 0 0 0'
                  className='gradient-text'
                >
                  Lost in Space
                </Heading>
              </Box>

              {/* Fun message */}
              <Text
                fontSize='1.5rem'
                margin='1rem 0'
                opacity={0.9}
                fontStyle='italic'
              >
                {randomMessage}
              </Text>

              {/* Subtitle */}
              <Text fontSize='1.1rem' margin='1rem 0 2rem' opacity={0.8}>
                Don't worry, even astronauts get lost sometimes! Let's get you
                back to something more interesting.
              </Text>

              {/* Buttons */}
              <HStack gap={4} flexWrap='wrap' justify='center' margin='2rem 0'>
                <Link to='/'>
                  <Button
                    className='glass-button glass-button-primary'
                    padding='12px 24px'
                    borderRadius='25px'
                    color='#333'
                    textDecoration='none'
                    display='inline-block'
                    fontSize='1rem'
                    fontWeight='500'
                  >
                    🏠 Go Home
                  </Button>
                </Link>
                <Link to='/blog'>
                  <Button
                    className='glass-button'
                    padding='12px 24px'
                    borderRadius='25px'
                    color='white'
                    textDecoration='none'
                    display='inline-block'
                    fontSize='1rem'
                    fontWeight='500'
                  >
                    📝 Read Blog
                  </Button>
                </Link>
                <Link to='/about'>
                  <Button
                    className='glass-button'
                    padding='12px 24px'
                    borderRadius='25px'
                    color='white'
                    textDecoration='none'
                    display='inline-block'
                    fontSize='1rem'
                    fontWeight='500'
                  >
                    👨‍💻 About Me
                  </Button>
                </Link>
              </HStack>

              {/* Loading indicator */}
              <Box marginTop='2rem' fontSize='0.9rem' opacity={0.7}>
                <Box className='spinner' />
                Redirecting to the main app...
              </Box>
            </VStack>
          </Container>
        </Box>
      </>
    );
  },
});
