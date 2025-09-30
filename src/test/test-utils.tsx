/* eslint-disable react-refresh/only-export-components */
import { render, type RenderOptions } from '@testing-library/react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig);

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library/react
export {
  render as testingLibraryRender,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  renderHook,
  type RenderOptions,
} from '@testing-library/react';

// Export our custom render as the default render
export { customRender as render };
