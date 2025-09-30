import React from 'react';
// import { Helmet } from 'react-helmet-async';
import {
  Box,
  Container,
  Flex,
  HStack,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  Tag,
  Separator,
  Badge,
} from '@chakra-ui/react';
// import { Link } from '@tanstack/react-router';
import { FiMail, FiExternalLink, FiDownload } from 'react-icons/fi';

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
              <Text color='blue.600' fontWeight='500'>
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

function CompanyLogo({ company }: { company: string }) {
  const logoMap: Record<string, string> = {
    google: '/assets/images/companies/google.svg',
    salesforce: '/assets/images/companies/salesforce.svg',
    tmobile: '/assets/images/companies/tmobile.jpeg',
    microsoft: '/assets/images/companies/microsoft.png',
    umd: '/assets/images/companies/umd.jpeg',
  };

  return (
    <Box mb={2}>
      <Box
        as='img'
        src={logoMap[company]}
        alt={company}
        height='20px'
        width='auto'
      />
    </Box>
  );
}

function ExperienceSection() {
  const experiences = [
    {
      title: 'Founder & Fractional CTO',
      company: 'Plutonic Consulting',
      period: 'May 2025 - Present',
      isCurrent: true,
      description:
        'Providing fractional CTO support, AI strategy, and scaling guidance to founders. Helping teams move faster with clear product bets, strong execution, and systems that are simple to maintain. Focus on pragmatic AI integration and developer experience optimization.',
      skills: [
        'AI Strategy',
        'Technical Leadership',
        'Fractional CTO',
        'Team Scaling',
      ],
    },
    {
      title: 'Staff Software Engineer / Engineering Manager',
      company: 'Google',
      period: 'May 2022 - Apr 2025',
      description:
        'Led technical direction and hands-on engineering for Gemini Code Assist, integrated into VSCode and IntelliJ IDEs. Implemented a symbol table generator across multiple languages, increasing context for LLM, reducing tokens, and significantly improving code completion acceptance rates.',
      skills: ['Go', 'TypeScript', 'Node.js', 'Kubernetes', 'GCP', 'LLM'],
    },
    {
      title: 'Senior Engineering Manager',
      company: 'Salesforce',
      period: 'Oct 2019 - Apr 2022',
      description:
        'Built CI pipeline (TACO) enabling 100+ partners to test connectors across Tableau/Salesforce stack. Delivered REST and native Salesforce connectors; owned Web Data Connector platform. Managed a team of 35+; drove hiring, mentoring, and technical strategy. Created Connector SDK adopted across the Tableau ecosystem.',
      skills: ['TypeScript', 'Node.js', 'Chromium', 'CI/CD', 'Team Leadership'],
    },
    {
      title: 'Director Of Engineering',
      company: 'T-Mobile',
      period: 'Nov 2018 - Oct 2019',
      description:
        'Hired a diverse team of 25 engineers in six weeks; managed four product teams totaling 35+ engineers across T-Mobile Retail Mobility. Delivered custom desktop & mobile applications for the T-Mobile / Sprint merger. Architected and implemented a portable Test Automation Framework that runs in-app.',
      skills: [
        'Team Leadership',
        'Rapid Hiring',
        'Mobile Development',
        'Test Automation',
        'Project Management',
      ],
    },
    {
      title: 'Software Development Engineer',
      company: 'Microsoft',
      period: 'Aug 2006 - Aug 2012',
      description:
        'Led multiple Bing teams including Bing Together, Task Framework, Ecosystem, Core Answers, Seasonal Answers, Structured Data, Commerce Relevance, and Commerce Data Pipeline. Architected Big Data Validation Framework (Engineering Excellence Award Nominee).',
      skills: [
        'Big Data',
        'JavaScript',
        'Machine Learning',
        'Outlook Web Access',
        'Bing',
      ],
    },
  ];

  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={6}
      borderRadius='2xl'
      mb={6}
    >
      <Heading size='lg' mb={6} color='blue.600'>
        Experience
      </Heading>

      {experiences.map((exp, index) => (
        <Box key={index}>
          <Flex justify='space-between' align='start' mb={2}>
            <VStack align='start' gap={1}>
              {exp.company === 'Google' && <CompanyLogo company='google' />}
              {exp.company === 'Salesforce' && (
                <CompanyLogo company='salesforce' />
              )}
              {exp.company === 'T-Mobile' && <CompanyLogo company='tmobile' />}
              {exp.company === 'Microsoft' && (
                <CompanyLogo company='microsoft' />
              )}
              <Heading size='md'>{exp.title}</Heading>
              <Text color='gray.600' fontSize='sm'>
                {exp.company}
              </Text>
            </VStack>
            {exp.isCurrent && (
              <Badge colorPalette='green' variant='subtle'>
                Current
              </Badge>
            )}
          </Flex>
          <Text fontSize='sm' color='gray.600' mb={3}>
            {exp.period}
          </Text>
          <Text mb={3}>{exp.description}</Text>
          <HStack wrap='wrap' gap={2}>
            {exp.skills.map(skill => (
              <Tag.Root key={skill} size='sm' variant='outline'>
                {skill}
              </Tag.Root>
            ))}
          </HStack>
          {index < experiences.length - 1 && <Separator my={6} />}
        </Box>
      ))}
    </Card.Root>
  );
}

function NotableProjectsSection() {
  const projects = [
    {
      title: 'Gemini Code Assist',
      period: '2022 - 2025',
      description:
        "Led technical direction and hands-on engineering for Google's AI coding assistant, integrated into VSCode and IntelliJ IDEs. Implemented a symbol table generator across multiple languages, increasing context for LLM, reducing tokens, and significantly improving code completion acceptance rates.",
      technologies: ['Go', 'TypeScript', 'Node.js', 'Kubernetes', 'GCP', 'LLM'],
    },
    {
      title: 'TACO Toolkit & Connector SDK',
      period: '2019 - 2022',
      description:
        "Built a robust CI/CD pipeline (TACO) enabling over 100 partners to test and deploy Tableau connectors efficiently. Created a Connector SDK widely adopted across Tableau's ecosystem, simplifying web data connector development.",
      technologies: [
        'TypeScript',
        'Node.js',
        'Chromium',
        'CI/CD',
        'SDK Development',
      ],
    },
  ];

  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={6}
      borderRadius='2xl'
      mb={6}
    >
      <Heading size='lg' mb={6} color='blue.600'>
        Notable Projects
      </Heading>

      {projects.map((project, index) => (
        <Box key={index}>
          <Heading size='md' mb={2}>
            {project.title}
          </Heading>
          <Text fontSize='sm' color='gray.600' mb={2}>
            {project.period}
          </Text>
          <Text mb={3}>{project.description}</Text>
          <HStack wrap='wrap' gap={2}>
            {project.technologies.map(tech => (
              <Tag.Root key={tech} size='sm' variant='subtle'>
                {tech}
              </Tag.Root>
            ))}
          </HStack>
          {index < projects.length - 1 && <Separator my={4} />}
        </Box>
      ))}
    </Card.Root>
  );
}

function SkillsSection() {
  const skillCategories = [
    {
      title: 'Languages',
      skills: ['TypeScript', 'JavaScript', 'Python', 'C#', 'Go', 'C++', 'Java'],
    },
    {
      title: 'Web & Mobile',
      skills: [
        'NodeJS',
        'Electron',
        'Express',
        'React',
        'React Native',
        'GraphQL',
        'Playwright',
        'VSCode Extensions',
      ],
    },
    {
      title: 'Databases & Cloud',
      skills: [
        'MongoDB',
        'Docker',
        'ElasticSearch',
        'Neo4J',
        'PostgreSQL',
        'Redis',
        'SQL Server',
        'AWS',
        'Google Cloud',
      ],
    },
    {
      title: 'AI & Leadership',
      skills: [
        'AI-Assisted Development',
        'Large Language Models',
        'Developer Tooling',
        'Platform Architecture',
        'Scalable Systems',
        'Full-Stack Engineering',
        'Mobile Development',
      ],
    },
  ];

  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={6}
      borderRadius='2xl'
      mb={6}
    >
      <Heading size='lg' mb={4} color='blue.600'>
        Technical Skills
      </Heading>

      <VStack align='stretch' gap={4}>
        {skillCategories.map((category, index) => (
          <Box key={index}>
            <Text fontWeight='semibold' mb={2}>
              {category.title}
            </Text>
            <HStack wrap='wrap' gap={2}>
              {category.skills.map(skill => (
                <Tag.Root key={skill} size='sm' variant='outline'>
                  {skill}
                </Tag.Root>
              ))}
            </HStack>
          </Box>
        ))}
      </VStack>
    </Card.Root>
  );
}

function EducationSection() {
  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={6}
      borderRadius='2xl'
      mb={6}
    >
      <Heading size='lg' mb={4} color='blue.600'>
        Education
      </Heading>
      <Box>
        <CompanyLogo company='umd' />
        <Heading size='md' mb={1}>
          B.S., Computer Science
        </Heading>
        <Text color='gray.600' fontSize='sm' mb={1}>
          University of Maryland, College Park
        </Text>
        <Text fontSize='sm' color='gray.600'>
          Minor in Business
        </Text>
      </Box>
    </Card.Root>
  );
}

function ContactSection() {
  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={6}
      borderRadius='2xl'
      mb={6}
    >
      <Heading size='lg' mb={4} color='blue.600'>
        Contact
      </Heading>
      <VStack align='stretch' gap={3}>
        <Box as='a' href='mailto:nick@karnik.io'>
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
            <FiMail />
            nick@karnik.io
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
            <FiExternalLink />
            LinkedIn
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
            <FiExternalLink />
            GitHub
          </Box>
        </Box>
        <Box as='a' href='https://calendly.com/nick-karnik' target='_blank'>
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
            <FiExternalLink />
            Schedule Call
          </Box>
        </Box>
      </VStack>
    </Card.Root>
  );
}

function HonorsSection() {
  const honors = [
    'Patent: Intelligent Intent Detection from Social Network Messages',
    'Microsoft Engineering Excellence Award Nominee',
    "Winner: Bing Hackday Spring '10 for best idea",
    "Bing Fall Hackday '10 project productized and patented",
    'Accepted into Y Combinator (2007)',
    'Mentor, blogger, open-source contributor',
  ];

  return (
    <Card.Root
      border='1px solid'
      borderColor='gray.200'
      p={6}
      borderRadius='2xl'
    >
      <Heading size='lg' mb={4} color='blue.600'>
        Honors & Highlights
      </Heading>
      <VStack align='stretch' gap={3}>
        {honors.map((honor, index) => (
          <Text key={index} fontSize='sm'>
            • {honor}
          </Text>
        ))}
      </VStack>
    </Card.Root>
  );
}

export function ResumePage() {
  return (
    <Box bg='gray.50' minH='100vh'>
      <Header />
      <Container as='main' maxW='6xl' py={{ base: 6, md: 10 }}>
        <Box maxW='4xl' mx='auto' p={6}>
          {/* Header Card */}
          <Card.Root
            border='1px solid'
            borderColor='gray.200'
            p={8}
            borderRadius='2xl'
            mb={8}
          >
            <Flex justify='space-between' align='start' wrap='wrap' gap={6}>
              <HStack gap={6} align='start'>
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
                  <Box
                    as='img'
                    src='/assets/images/profile/nick-karnik.jpeg'
                    alt='Nick Karnik'
                    width='100%'
                    height='100%'
                    borderRadius='50%'
                    objectFit='cover'
                  />
                </Box>
                <VStack align='start' gap={2}>
                  <Heading size='3xl'>Nick Karnik</Heading>
                  <Text fontSize='lg' color='gray.600'>
                    Staff Software Engineer & Engineering Leader
                  </Text>
                  <HStack gap={2} wrap='wrap'>
                    {[
                      'TypeScript',
                      'React',
                      'Developer Experience',
                      'NodeJS',
                      'AI',
                    ].map(tag => (
                      <Tag.Root
                        key={tag}
                        size='md'
                        variant='subtle'
                        colorPalette='blue'
                      >
                        {tag}
                      </Tag.Root>
                    ))}
                  </HStack>
                </VStack>
              </HStack>
              <VStack align='end' gap={3}>
                <Box
                  as='a'
                  href='/resume.pdf'
                  target='_blank'
                  download='resume-nick-karnik.pdf'
                >
                  <Box
                    display='inline-flex'
                    alignItems='center'
                    gap={2}
                    px={4}
                    py={2}
                    border='1px solid'
                    borderColor='blue.200'
                    borderRadius='md'
                    color='blue.600'
                    _hover={{ bg: 'blue.50' }}
                  >
                    <FiDownload />
                    Download PDF
                  </Box>
                </Box>
                <HStack gap={2}>
                  <Box as='a' href='mailto:nick@karnik.io'>
                    <Box
                      display='inline-flex'
                      alignItems='center'
                      gap={2}
                      px={3}
                      py={2}
                      borderRadius='md'
                      color='gray.600'
                      _hover={{ bg: 'gray.50' }}
                    >
                      <FiMail />
                      Email
                    </Box>
                  </Box>
                  <Box
                    as='a'
                    href='https://www.linkedin.com/in/theoutlander'
                    target='_blank'
                  >
                    <Box
                      display='inline-flex'
                      alignItems='center'
                      gap={2}
                      px={3}
                      py={2}
                      borderRadius='md'
                      color='gray.600'
                      _hover={{ bg: 'gray.50' }}
                    >
                      <FiExternalLink />
                      LinkedIn
                    </Box>
                  </Box>
                </HStack>
              </VStack>
            </Flex>
          </Card.Root>

          {/* Main Content Grid */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
            {/* Left Column - Experience */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <ExperienceSection />
              <NotableProjectsSection />
            </Box>

            {/* Right Column - Skills & Info */}
            <VStack align='stretch' gap={6}>
              <SkillsSection />
              <EducationSection />
              <ContactSection />
              <HonorsSection />
            </VStack>
          </SimpleGrid>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
