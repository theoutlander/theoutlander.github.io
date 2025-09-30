import {
  Box,
  HStack,
  Link,
  Icon,
  Text,
  VStack,
  Container,
  Separator,
} from '@chakra-ui/react';
import {
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiYoutube,
  FiMail,
} from 'react-icons/fi';
import { FaStackOverflow, FaNodeJs, FaReact } from 'react-icons/fa';
import { SiTypescript } from 'react-icons/si';

export default function Footer() {
  return (
    <Box
      as='footer'
      py={12}
      bg='gray.50'
      borderTop='1px solid'
      borderColor='gray.200'
    >
      <Container maxW='6xl'>
        <VStack gap={8}>
          {/* Main content row */}
          <HStack
            justify='space-between'
            align='start'
            w='full'
            gap={8}
            flexWrap='wrap'
          >
            {/* Left: About */}
            <VStack align='start' gap={4} flex='1' minW='300px'>
              <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
                Nick Karnik
              </Text>
              <Text fontSize='sm' color='gray.600' lineHeight={1.6}>
                Engineering Leader & Staff Software Engineer
              </Text>
              <HStack gap={4}>
                <HStack
                  gap={2}
                  _hover={{
                    transform: 'translateY(-1px)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  cursor='default'
                >
                  <Icon as={FaNodeJs} color='green.500' boxSize={4} />
                  <Text fontSize='sm' color='gray.600'>
                    Node
                  </Text>
                </HStack>
                <HStack
                  gap={2}
                  _hover={{
                    transform: 'translateY(-1px)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  cursor='default'
                >
                  <Icon as={FaReact} color='blue.400' boxSize={4} />
                  <Text fontSize='sm' color='gray.600'>
                    React
                  </Text>
                </HStack>
                <HStack
                  gap={2}
                  _hover={{
                    transform: 'translateY(-1px)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  cursor='default'
                >
                  <Icon as={SiTypescript} color='blue.600' boxSize={4} />
                  <Text fontSize='sm' color='gray.600'>
                    TypeScript
                  </Text>
                </HStack>
              </HStack>
            </VStack>

            {/* Right: Social Links */}
            <VStack align='start' gap={4} minW='200px'>
              <Text fontSize='sm' fontWeight='semibold' color='gray.800'>
                Connect
              </Text>
              <HStack gap={6}>
                <Link
                  href='mailto:nick@karnik.io'
                  _hover={{ color: 'blue.500' }}
                  transition='color 0.2s'
                  aria-label='Send email to Nick Karnik'
                >
                  <Icon as={FiMail} boxSize={5} />
                </Link>
                <Link
                  href='https://github.com/theoutlander'
                  target='_blank'
                  rel='noopener noreferrer'
                  _hover={{ color: 'blue.500' }}
                  transition='color 0.2s'
                  aria-label='Visit Nick Karnik on GitHub'
                >
                  <Icon as={FiGithub} boxSize={5} />
                </Link>
                <Link
                  href='https://linkedin.com/in/theoutlander'
                  target='_blank'
                  rel='noopener noreferrer'
                  _hover={{ color: 'blue.500' }}
                  transition='color 0.2s'
                  aria-label='Connect with Nick Karnik on LinkedIn'
                >
                  <Icon as={FiLinkedin} boxSize={5} />
                </Link>
                <Link
                  href='https://twitter.com/theoutlander'
                  target='_blank'
                  rel='noopener noreferrer'
                  _hover={{ color: 'blue.500' }}
                  transition='color 0.2s'
                  aria-label='Follow Nick Karnik on Twitter'
                >
                  <Icon as={FiTwitter} boxSize={5} />
                </Link>
                <Link
                  href='https://youtube.com/@nick-karnik'
                  target='_blank'
                  rel='noopener noreferrer'
                  _hover={{ color: 'blue.500' }}
                  transition='color 0.2s'
                  aria-label='Subscribe to Nick Karnik on YouTube'
                >
                  <Icon as={FiYoutube} boxSize={5} />
                </Link>
                <Link
                  href='https://stackoverflow.com/users/460472/nick'
                  target='_blank'
                  rel='noopener noreferrer'
                  _hover={{ color: 'blue.500' }}
                  transition='color 0.2s'
                  aria-label='View Nick Karnik on Stack Overflow'
                >
                  <Icon as={FaStackOverflow} boxSize={5} />
                </Link>
              </HStack>
              <Text fontSize='xs' color='gray.500'>
                Available for consulting at{' '}
                <Link
                  href='https://plutonic.consulting'
                  target='_blank'
                  rel='noopener noreferrer'
                  color='blue.500'
                  _hover={{ color: 'blue.600' }}
                  textDecoration='underline'
                >
                  Plutonic Consulting
                </Link>
              </Text>
            </VStack>
          </HStack>

          <Separator />

          {/* Bottom: Copyright */}
          <Text fontSize='xs' color='gray.500' textAlign='center'>
            © {new Date().getFullYear()} Nick Karnik. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
