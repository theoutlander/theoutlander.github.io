import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Separator,
  Container,
  Badge,
  Avatar,
  Textarea,
  Input,
  Field,
  Alert,
  Spinner,
} from '@chakra-ui/react';
import { FaComment, FaHeart, FaPaperPlane } from 'react-icons/fa';
import { GraphQLClient, gql } from 'graphql-request';

interface HashnodeCommentsProps {
  postUrl: string;
}

interface Comment {
  id: string;
  content: {
    text: string;
  };
  author: {
    name: string;
    profilePicture?: string;
    username?: string;
  };
  dateAdded: string;
}

interface CommentFormData {
  name: string;
  email: string;
  content: string;
}

const client = new GraphQLClient('https://gql.hashnode.com');

// GraphQL queries for Hashnode comments
const GET_COMMENTS = gql`
  query GetComments($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        id
        title
        comments(first: 50) {
          edges {
            node {
              id
              content {
                text
              }
              author {
                name
                profilePicture
                username
              }
              dateAdded
            }
          }
        }
      }
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      comment {
        id
        content {
          text
        }
        author {
          name
          profilePicture
          username
        }
        dateAdded
      }
    }
  }
`;

export default function HashnodeComments({ postUrl }: HashnodeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [actualPostId, setActualPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommentFormData>({
    name: '',
    email: '',
    content: '',
  });
  const commentsRef = useRef<HTMLDivElement>(null);

  // Extract post slug from URL if not provided
  const extractPostSlug = (url: string): string | null => {
    // Extract slug from nick.karnik.io/blog/slug format
    const match = url.match(/nick\.karnik\.io\/blog\/([^/]+)/);
    return match ? match[1] : null;
  };

  const currentPostSlug = extractPostSlug(postUrl);

  const fetchComments = useCallback(async () => {
    if (!currentPostSlug) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching comments for post slug:', currentPostSlug);

      const data = await client.request<{
        publication: {
          post: {
            id: string;
            title: string;
            comments: {
              edges: Array<{
                node: Comment;
              }>;
            };
          };
        };
      }>(GET_COMMENTS, {
        host: 'nickkarnik.hashnode.dev',
        slug: currentPostSlug,
      });

      console.log('API response:', data);
      const post = data.publication?.post;
      if (post) {
        console.log('Setting actualPostId to:', post.id);
        setActualPostId(post.id);
        const commentsData = post.comments?.edges?.map(edge => edge.node) || [];
        setComments(commentsData);
      } else {
        console.warn('No post found in API response');
        setError('Post not found. Comments may not be available.');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentPostSlug]);

  useEffect(() => {
    if (!currentPostSlug) {
      setError('Unable to determine post slug for comments');
      setLoading(false);
      return;
    }

    fetchComments();
  }, [currentPostSlug, fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for missing post ID first
    if (!actualPostId) {
      setError(
        'Comments are not available for this post. Please try refreshing the page.'
      );
      return;
    }

    // Check for missing form fields
    if (!formData.name || !formData.email || !formData.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const data = await client.request<{
        addComment: {
          comment?: Comment;
        };
      }>(ADD_COMMENT, {
        input: {
          postId: actualPostId,
          contentMarkdown: formData.content,
        },
      });

      if (data.addComment.comment) {
        // Convert the response to match our Comment interface
        const newComment: Comment = {
          id: data.addComment.comment.id,
          content: { text: data.addComment.comment.content.text },
          author: data.addComment.comment.author,
          dateAdded: data.addComment.comment.dateAdded,
        };
        setComments(prev => [newComment, ...prev]);
        setFormData({ name: '', email: '', content: '' });
        setShowForm(false);
      } else {
        setError('Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentPostSlug) {
    return (
      <Box mt={12} pt={8}>
        <Separator mb={8} />
        <Alert.Root status='warning'>
          <Alert.Indicator />
          Comments are not available for this post.
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box mt={12} pt={8}>
      <Separator mb={8} />

      <Container maxW='3xl' px={0}>
        <VStack align='stretch' gap={6}>
          <HStack gap={3} align='center' justify='space-between'>
            <HStack gap={3} align='center'>
              <Icon as={FaComment} color='blue.500' boxSize={5} />
              <Heading size='lg' color='gray.800'>
                Comments
              </Heading>
              <Badge colorPalette='blue' variant='subtle'>
                {comments.length}{' '}
                {comments.length === 1 ? 'Comment' : 'Comments'}
              </Badge>
            </HStack>
            <Icon as={FaHeart} color='red.400' boxSize={4} />
          </HStack>

          <Text color='gray.600' fontSize='md' lineHeight='1.6'>
            Share your thoughts and join the discussion! Leave a comment below.
          </Text>

          {error && (
            <Alert.Root status='error'>
              <Alert.Indicator />
              {error}
            </Alert.Root>
          )}

          {!showForm && (
            <Button
              variant='solid'
              colorPalette='blue'
              onClick={() => setShowForm(true)}
              alignSelf='flex-start'
            >
              <Icon as={FaComment} mr={2} />
              Add a Comment
            </Button>
          )}

          {showForm && (
            <Box
              p={6}
              bg='gray.50'
              borderRadius='xl'
              border='1px solid'
              borderColor='gray.200'
            >
              <form onSubmit={handleSubmitComment}>
                <VStack gap={4} align='stretch'>
                  <HStack gap={4}>
                    <Field.Root required>
                      <Field.Label fontSize='sm'>Name</Field.Label>
                      <Input
                        value={formData.name}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder='Your name'
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label fontSize='sm'>Email</Field.Label>
                      <Input
                        type='email'
                        value={formData.email}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder='your@email.com'
                      />
                    </Field.Root>
                  </HStack>
                  <Field.Root required>
                    <Field.Label fontSize='sm'>Comment</Field.Label>
                    <Textarea
                      value={formData.content}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder='Write your comment here...'
                      rows={4}
                      resize='vertical'
                    />
                  </Field.Root>
                  <HStack gap={3}>
                    <Button
                      type='submit'
                      variant='solid'
                      colorPalette='blue'
                      loading={submitting}
                      loadingText='Posting...'
                      disabled={!actualPostId || submitting}
                    >
                      <Icon as={FaPaperPlane} mr={2} />
                      {!actualPostId ? 'Loading...' : 'Post Comment'}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </Box>
          )}

          <Box
            ref={commentsRef}
            minH='200px'
            borderRadius='xl'
            overflow='hidden'
            border='1px solid'
            borderColor='gray.200'
            boxShadow='sm'
            bg='white'
          >
            {loading ? (
              <Box p={8} textAlign='center'>
                <Spinner size='lg' color='blue.500' />
                <Text mt={4} color='gray.600'>
                  Loading comments...
                </Text>
              </Box>
            ) : comments.length === 0 ? (
              <Box p={8} textAlign='center'>
                <Icon as={FaComment} boxSize={12} color='gray.300' />
                <Text mt={4} color='gray.600'>
                  No comments yet. Be the first to comment!
                </Text>
              </Box>
            ) : (
              <VStack gap={0} align='stretch'>
                {comments.map(comment => (
                  <Box
                    key={comment.id}
                    p={6}
                    borderBottom='1px solid'
                    borderColor='gray.100'
                    _last={{ borderBottom: 'none' }}
                  >
                    <VStack gap={3} align='stretch'>
                      <HStack gap={3} align='start'>
                        <Avatar.Root size='sm'>
                          <Avatar.Image
                            src={comment.author.profilePicture}
                            alt={comment.author.name}
                          />
                          <Avatar.Fallback>
                            {comment.author.name.charAt(0)}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <VStack gap={1} align='start' flex={1}>
                          <HStack gap={2}>
                            <Text fontWeight='medium' fontSize='sm'>
                              {comment.author.name}
                            </Text>
                            {comment.author.username && (
                              <Text color='gray.500' fontSize='xs'>
                                @{comment.author.username}
                              </Text>
                            )}
                          </HStack>
                          <Text color='gray.500' fontSize='xs'>
                            {formatDate(comment.dateAdded)}
                          </Text>
                        </VStack>
                      </HStack>
                      <Text
                        color='gray.800'
                        lineHeight='1.6'
                        whiteSpace='pre-wrap'
                      >
                        {comment.content.text}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
