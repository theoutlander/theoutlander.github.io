import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Center,
  HStack,
  Badge,
  Textarea,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

// Fun 404 illustrations using Chakra UI components
const NotFoundIllustration = () => {
  return (
    <Box
      position='relative'
      w='full'
      maxW='400px'
      mx='auto'
      // padding={-100}
      // margin={-100}
    >
      {/* Main 404 text with fun styling */}
      <Center>
        <VStack gap={4}>
          {/* Fun floating elements */}
          <Box position='relative' w='200px' h='100px'>
            <Box
              position='absolute'
              top='20px'
              left='20px'
              w='20px'
              h='20px'
              bg='blue.300'
              borderRadius='50%'
              animation='fadeInFloat 0.6s ease-out 0.5s both, float 3s ease-in-out infinite 1s'
            />
            <Box
              position='absolute'
              top='40px'
              right='30px'
              w='15px'
              h='15px'
              bg='purple.300'
              borderRadius='50%'
              animation='fadeInFloat 0.6s ease-out 0.7s both, float 3s ease-in-out infinite 2s'
            />
            <Box
              position='absolute'
              bottom='20px'
              left='50px'
              w='12px'
              h='12px'
              bg='pink.300'
              borderRadius='50%'
              animation='fadeInFloat 0.6s ease-out 0.9s both, float 3s ease-in-out infinite 3s'
            />
          </Box>
        </VStack>
      </Center>

      {/* CSS for animations */}
      <style>
        {`
					@keyframes scaleIn {
						0% {
							opacity: 0;
							transform: scale(0.8);
						}
						100% {
							opacity: 1;
							transform: scale(1);
						}
					}
					@keyframes fadeInFloat {
						0% {
							opacity: 0;
							transform: translateY(20px);
						}
						100% {
							opacity: 1;
							transform: translateY(0);
						}
					}
					@keyframes fadeInUp {
						0% {
							opacity: 0;
							transform: translateY(30px);
						}
						100% {
							opacity: 1;
							transform: translateY(0);
						}
					}
					@keyframes float {
						0%, 100% { transform: translateY(0px); }
						50% { transform: translateY(-20px); }
					}
				`}
      </style>
    </Box>
  );
};

const CodingChallenges = [
  {
    title: '🐛 Debug Challenge',
    problem: 'Find the bug in this function:',
    code: `function findSum(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    hint: 'What happens when i equals arr.length?',
    solution: 'Change i <= arr.length to i < arr.length',
    explanation:
      'The bug is an off-by-one error. When i equals arr.length, arr[i] is undefined, causing NaN in the sum.',
  },
  {
    title: '🧮 Algorithm Puzzle',
    problem: "What's the time complexity of this function?",
    code: `function mystery(n) {
  if (n <= 1) return n;
  return mystery(n-1) + mystery(n-2);
}`,
    hint: 'This is a famous sequence...',
    solution: 'O(2^n) - Fibonacci with exponential time complexity',
    explanation:
      'This is the Fibonacci function. Each call makes two recursive calls, leading to exponential growth.',
  },
  {
    title: '🔍 Logic Riddle',
    problem: 'What will this code output?',
    code: `console.log(0.1 + 0.2 === 0.3);`,
    hint: 'Think about floating point precision...',
    solution: 'false',
    explanation:
      'Due to floating point precision, 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3.',
  },
  {
    title: '🎯 JavaScript Quirk',
    problem: "What's the result of this expression?",
    code: `[] + [] + 'foo'.split('')`,
    hint: 'What happens when you add arrays?',
    solution: "'f,o,o'",
    explanation:
      "Arrays convert to strings when added, so [] + [] = '' and 'foo'.split('') = ['f','o','o'] which becomes 'f,o,o'.",
  },
  {
    title: '⚡ Performance Challenge',
    problem: 'How would you optimize this function?',
    code: `function isPrime(n) {
  for (let i = 2; i < n; i++) {
    if (n % i === 0) return false;
  }
  return n > 1;
}`,
    hint: "You don't need to check all numbers up to n...",
    solution: 'Check only up to Math.sqrt(n)',
    explanation:
      'If n has a factor greater than √n, it must also have a factor less than √n. So we only need to check up to √n.',
  },
];

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

export const Route = createFileRoute('/lost')({
  component: function NotFoundPage() {
    const [currentChallenge, setCurrentChallenge] = React.useState(0);
    const [showHint, setShowHint] = React.useState(false);
    const [showSolution, setShowSolution] = React.useState(false);
    const [userSolution, setUserSolution] = React.useState('');
    const [testResult, setTestResult] = React.useState('');

    const randomMessage =
      FunMessages[Math.floor(Math.random() * FunMessages.length)];
    const challenge = CodingChallenges[currentChallenge];

    const nextChallenge = () => {
      setCurrentChallenge(prev => (prev + 1) % CodingChallenges.length);
      setShowHint(false);
      setShowSolution(false);
      setUserSolution('');
      setTestResult('');
    };

    const toggleHint = () => setShowHint(!showHint);
    const toggleSolution = () => setShowSolution(!showSolution);

    const testSolution = () => {
      try {
        // Create a safe evaluation context
        const testCases = [
          { input: [1, 2, 3, 4, 5], expected: 15 },
          { input: [10, 20, 30], expected: 60 },
          { input: [], expected: 0 },
          { input: [5], expected: 5 },
        ];

        let passedTests = 0;
        const results = [];

        for (const testCase of testCases) {
          try {
            // Create a function from user's solution
            const userFunction = new Function(
              'arr',
              `return (${userSolution})(arr)`
            );
            const result = userFunction(testCase.input);

            if (result === testCase.expected) {
              passedTests++;
              results.push(
                `✅ Test passed: [${testCase.input.join(', ')}] → ${result}`
              );
            } else {
              results.push(
                `❌ Test failed: [${testCase.input.join(
                  ', '
                )}] → ${result} (expected ${testCase.expected})`
              );
            }
          } catch (error) {
            results.push(
              `❌ Error: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }

        const resultText =
          results.join('\n') +
          `\n\n🎯 Result: ${passedTests}/${testCases.length} tests passed`;
        setTestResult(resultText);
      } catch (error) {
        setTestResult(
          `❌ Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };

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

        <Container maxW='4xl' py={0} position='relative'>
          {/* Background illustration */}
          <Box
            position='absolute'
            top='50%'
            left='50%'
            transform='translate(-50%, -50%)'
            opacity={0.1}
            zIndex={0}
            pointerEvents='none'
          >
            <NotFoundIllustration />
          </Box>

          {/* Main content */}
          <VStack gap={4} align='center' position='relative' zIndex={1}>
            <Box animation='fadeInUp 0.6s ease-out 0.3s both'>
              <Heading size='xl' color='gray.600' textAlign='center'>
                {randomMessage}
              </Heading>
            </Box>

            <Box animation='fadeInUp 0.6s ease-out 0.5s both' mb={8}>
              <Text
                fontSize='lg'
                color='gray.500'
                lineHeight='tall'
                textAlign='center'
              >
                While you're here, why not solve a quick coding challenge? It's
                more fun than staring at a blank page! 🧠
              </Text>
            </Box>

            {/* Coding Challenge Section */}
            <Box
              animation='fadeInUp 0.6s ease-out 0.7s both'
              w='full'
              maxW='4xl'
              bg='white'
              p={4}
              borderRadius='lg'
              border='1px solid'
              borderColor='gray.200'
              boxShadow='0 4px 20px rgba(0, 0, 0, 0.1)'
            >
              <VStack gap={2} align='stretch'>
                <HStack justify='space-between' align='center'>
                  <Heading size='md' color='purple.600'>
                    {challenge.title}
                  </Heading>
                  <Badge colorScheme='purple' variant='subtle'>
                    {currentChallenge + 1} of {CodingChallenges.length}
                  </Badge>
                </HStack>

                <Text fontSize='md' color='gray.700' textAlign='left'>
                  {challenge.problem}
                </Text>

                <Box
                  bg='#0d1117'
                  p={4}
                  borderRadius='12px'
                  fontFamily="'Fira Code', 'JetBrains Mono', 'Courier New', monospace"
                  fontSize='14px'
                  overflowX='auto'
                  border='1px solid #30363d'
                  boxShadow='0 8px 24px rgba(0, 0, 0, 0.3)'
                  position='relative'
                >
                  {/* Decorative elements */}
                  <Box
                    position='absolute'
                    top='12px'
                    right='12px'
                    display='flex'
                    gap='6px'
                  >
                    <Box w='12px' h='12px' bg='#ff5f56' borderRadius='50%' />
                    <Box w='12px' h='12px' bg='#ffbd2e' borderRadius='50%' />
                    <Box w='12px' h='12px' bg='#27ca3f' borderRadius='50%' />
                  </Box>

                  {/* Syntax highlighted code */}
                  <Box
                    as='pre'
                    m={0}
                    whiteSpace='pre'
                    lineHeight='1.6'
                    dangerouslySetInnerHTML={{
                      __html: challenge.code
                        .replace(
                          /\b(function|let|for|if|return|const|var)\b/g,
                          '<span style="color: #ff7b72; font-weight: bold;">$1</span>'
                        )
                        .replace(
                          /\b(findSum|arr|sum|i|length)\b/g,
                          '<span style="color: #ffa657;">$1</span>'
                        )
                        .replace(
                          /([{}();])/g,
                          '<span style="color: #f0f6fc;">$1</span>'
                        )
                        .replace(
                          /([=<>!+\-*/])/g,
                          '<span style="color: #f0f6fc;">$1</span>'
                        )
                        .replace(
                          /(\d+)/g,
                          '<span style="color: #79c0ff;">$1</span>'
                        )
                        .replace(
                          /(['"`][^'"`]*['"`])/g,
                          '<span style="color: #a5d6ff;">$1</span>'
                        )
                        .replace(
                          /(\/\/.*$)/gm,
                          '<span style="color: #8b949e; font-style: italic;">$1</span>'
                        ),
                    }}
                  />
                </Box>

                {/* Code Editor Section */}
                <Box
                  bg='#f8f9fa'
                  p={4}
                  borderRadius='12px'
                  border='1px solid #e9ecef'
                  borderLeft='4px solid #8b5cf6'
                  boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'
                >
                  <VStack gap={2} align='stretch'>
                    <Text fontSize='sm' fontWeight='semibold' color='gray.700'>
                      💻 Your Solution:
                    </Text>
                    <Textarea
                      value={userSolution}
                      onChange={e => setUserSolution(e.target.value)}
                      placeholder='Write your solution here... (e.g., function findSum(arr) { ... })'
                      fontFamily="'Fira Code', 'JetBrains Mono', 'Courier New', monospace"
                      fontSize='14px'
                      minH='80px'
                      bg='white'
                      border='2px solid #e2e8f0'
                      borderRadius='8px'
                      p={3}
                      resize='vertical'
                      borderColor={
                        userSolution && testResult && testResult.includes('❌')
                          ? '#ef4444'
                          : userSolution &&
                              testResult &&
                              testResult.includes('✅')
                            ? '#10b981'
                            : '#e2e8f0'
                      }
                      _focus={{
                        borderColor: '#8b5cf6',
                        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                      }}
                      _hover={{
                        borderColor: '#8b5cf6',
                      }}
                      title='Write your JavaScript function here. Make sure to include proper syntax!'
                      transition='all 0.2s ease'
                    />
                    <HStack gap={3}>
                      <Button
                        bg='linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                        color='white'
                        border='none'
                        px={6}
                        py={3}
                        borderRadius='8px'
                        cursor='pointer'
                        fontSize='14px'
                        fontWeight='semibold'
                        onClick={testSolution}
                        disabled={!userSolution.trim()}
                        _hover={{
                          bg: !userSolution.trim()
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                            : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          transform: !userSolution.trim()
                            ? 'none'
                            : 'translateY(-2px)',
                          boxShadow: !userSolution.trim()
                            ? 'none'
                            : '0 8px 25px rgba(139, 92, 246, 0.4)',
                        }}
                        _disabled={{
                          bg: '#9ca3af',
                          cursor: 'not-allowed',
                          transform: 'none',
                          boxShadow: 'none',
                        }}
                        title={
                          !userSolution.trim()
                            ? 'Write some code first!'
                            : 'Run your code against test cases'
                        }
                        transition='all 0.2s ease'
                      >
                        🧪 Test Solution
                      </Button>
                      <Button
                        bg='transparent'
                        color='#6b7280'
                        border='2px solid #e2e8f0'
                        px={6}
                        py={3}
                        borderRadius='8px'
                        cursor='pointer'
                        fontSize='14px'
                        fontWeight='semibold'
                        onClick={() => {
                          setUserSolution('');
                          setTestResult('');
                        }}
                        _hover={{
                          bg: '#f8fafc',
                          borderColor: '#8b5cf6',
                          color: '#8b5cf6',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)',
                        }}
                        title='Clear your current solution and start over'
                        transition='all 0.2s ease'
                      >
                        🗑️ Clear
                      </Button>
                    </HStack>
                  </VStack>
                </Box>

                {/* Test Results */}
                {testResult && (
                  <Box
                    bg={
                      testResult.includes('✅')
                        ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                        : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                    }
                    p={4}
                    borderRadius='12px'
                    border='2px solid'
                    borderColor={
                      testResult.includes('✅') ? '#10b981' : '#ef4444'
                    }
                    fontFamily="'Fira Code', 'JetBrains Mono', 'Courier New', monospace"
                    fontSize='12px'
                    whiteSpace='pre-wrap'
                    color={testResult.includes('✅') ? '#065f46' : '#991b1b'}
                    boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'
                    position='relative'
                    overflow='hidden'
                  >
                    {/* Decorative background pattern */}
                    <Box
                      position='absolute'
                      top='0'
                      right='0'
                      w='100px'
                      h='100px'
                      opacity='0.1'
                      bg={testResult.includes('✅') ? '#10b981' : '#ef4444'}
                      borderRadius='50%'
                      transform='translate(30px, -30px)'
                    />
                    <Box position='relative' zIndex={1}>
                      {testResult}
                    </Box>
                  </Box>
                )}

                <HStack gap={3} justify='center' flexWrap='wrap' mt={4}>
                  <Button
                    size='md'
                    variant='outline'
                    colorScheme='blue'
                    onClick={toggleHint}
                    borderRadius='8px'
                    fontWeight='semibold'
                    px={6}
                    py={3}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                      bg: 'blue.50',
                    }}
                    title={
                      showHint
                        ? 'Hide the hint'
                        : 'Get a helpful hint to solve this challenge'
                    }
                    transition='all 0.2s ease'
                  >
                    {showHint ? '🙈 Hide' : '💡 Show'} Hint
                  </Button>
                  <Button
                    size='md'
                    variant='outline'
                    colorScheme='green'
                    onClick={toggleSolution}
                    borderRadius='8px'
                    fontWeight='semibold'
                    px={6}
                    py={3}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                      bg: 'green.50',
                    }}
                    title={
                      showSolution
                        ? 'Hide the solution'
                        : 'Reveal the complete solution and explanation'
                    }
                    transition='all 0.2s ease'
                  >
                    {showSolution ? '🙈 Hide' : '🎯 Show'} Solution
                  </Button>
                  <Button
                    size='md'
                    bg='linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                    color='white'
                    onClick={nextChallenge}
                    borderRadius='8px'
                    fontWeight='semibold'
                    px={6}
                    py={3}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)',
                      bg: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    }}
                    title='Move to the next coding challenge'
                    transition='all 0.2s ease'
                  >
                    🚀 Next Challenge →
                  </Button>
                </HStack>

                {showHint && (
                  <Box
                    bg='linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                    p={4}
                    borderRadius='12px'
                    border='2px solid'
                    borderColor='blue.300'
                    boxShadow='0 4px 12px rgba(59, 130, 246, 0.15)'
                    position='relative'
                    overflow='hidden'
                  >
                    <Box
                      position='absolute'
                      top='-10px'
                      right='-10px'
                      w='60px'
                      h='60px'
                      bg='blue.200'
                      borderRadius='50%'
                      opacity='0.3'
                    />
                    <Text
                      fontSize='md'
                      color='blue.800'
                      fontWeight='medium'
                      position='relative'
                      zIndex={1}
                    >
                      💡 <strong>Hint:</strong> {challenge.hint}
                    </Text>
                  </Box>
                )}

                {showSolution && (
                  <Box
                    bg='linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                    p={4}
                    borderRadius='12px'
                    border='2px solid'
                    borderColor='green.300'
                    boxShadow='0 4px 12px rgba(34, 197, 94, 0.15)'
                    position='relative'
                    overflow='hidden'
                  >
                    <Box
                      position='absolute'
                      top='-10px'
                      right='-10px'
                      w='60px'
                      h='60px'
                      bg='green.200'
                      borderRadius='50%'
                      opacity='0.3'
                    />
                    <VStack
                      gap={2}
                      align='stretch'
                      position='relative'
                      zIndex={1}
                    >
                      <Text fontSize='md' color='green.800' fontWeight='medium'>
                        ✅ <strong>Solution:</strong> {challenge.solution}
                      </Text>
                      <Text fontSize='sm' color='green.700' lineHeight='1.6'>
                        {challenge.explanation}
                      </Text>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </Container>
      </>
    );
  },
});
