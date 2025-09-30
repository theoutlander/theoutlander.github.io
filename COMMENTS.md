# Comments System

This blog now includes a modern comments system with two options: **Giscus** (GitHub Discussions) and **Utterances** (GitHub Issues).

## Features

- 🎨 **Modern UI** - Built with ChakraUI Pro v3 for a beautiful, responsive design
- 🔄 **Switchable Systems** - Toggle between Giscus and Utterances
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast Loading** - Lazy loading and optimized performance
- 🔧 **Configurable** - Easy to customize via configuration file

## Comment Systems

### Giscus (Default)

- Uses GitHub Discussions for comments
- More modern interface with reactions
- Better for community discussions
- Requires GitHub Discussions to be enabled on your repository

### Utterances

- Uses GitHub Issues for comments
- Simpler setup
- Good for basic commenting needs
- Works with any GitHub repository

## Configuration

All settings are centralized in `src/lib/comments.ts`:

```typescript
export const COMMENTS_CONFIG = {
  defaultSystem: 'giscus', // or "utterances"
  githubRepo: 'theoutlander/theoutlander.github.io',
  // ... other settings
};
```

## Setup Instructions

### For Giscus (Recommended)

1. **Enable GitHub Discussions** on your repository
2. **Install Giscus App** on your repository
3. **Update configuration** in `src/lib/comments.ts`:
   - Set your repository name
   - Get your repository ID from Giscus setup
   - Set category and category ID

### For Utterances

1. **Install Utterances App** on your repository
2. **Update configuration** in `src/lib/comments.ts`:
   - Set your repository name
   - Choose your theme preference

## Usage

The comments system is automatically integrated into all blog posts via the `PostView` component. Users can:

- Switch between comment systems using the dropdown
- View all discussions/issues on GitHub
- Scroll directly to the comments section
- Sign in with GitHub to participate

## Customization

### Styling

- Modify `src/components/blog/Comments.tsx` for Giscus styling
- Modify `src/components/blog/UtterancesComments.tsx` for Utterances styling

### Configuration

- Update `src/lib/comments.ts` for system settings
- Change default comment system
- Modify GitHub repository settings
- Update URLs and themes

## Files Added/Modified

- `src/components/blog/Comments.tsx` - Main comments component (Giscus)
- `src/components/blog/UtterancesComments.tsx` - Utterances comments component
- `src/lib/comments.ts` - Configuration file
- `src/components/blog/PostView.tsx` - Integrated comments into blog posts

## Troubleshooting

### Comments Not Loading

1. Check that the GitHub app is installed on your repository
2. Verify repository name in configuration
3. Ensure GitHub Discussions/Issues are enabled
4. Check browser console for errors

### Styling Issues

1. Verify ChakraUI Pro v3 is properly installed
2. Check for CSS conflicts
3. Ensure responsive breakpoints are working

### Performance

1. Comments are lazy-loaded for better performance
2. Scripts are loaded only on client-side
3. Cleanup is handled automatically

## Support

For issues with the comments system, check:

- [Giscus Documentation](https://giscus.app/)
- [Utterances Documentation](https://utteranc.es/)
- [ChakraUI Pro v3 Documentation](https://pro.chakra-ui.com/)
