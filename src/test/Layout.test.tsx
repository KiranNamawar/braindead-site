import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

const renderLayout = (children: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <Layout>{children}</Layout>
    </BrowserRouter>
  );
};

describe('Layout', () => {
  test('renders children content', () => {
    renderLayout(<div>Test Content</div>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('applies dark theme styling', () => {
    const { container } = renderLayout(<div>Test</div>);
    const mainElement = container.querySelector('div');
    expect(mainElement).toHaveClass('bg-gray-950');
  });

  test('has animated background elements', () => {
    const { container } = renderLayout(<div>Test</div>);
    const backgroundElements = container.querySelectorAll('.bg-gradient-to-br');
    expect(backgroundElements.length).toBeGreaterThan(0);
  });

  test('contains main content area', () => {
    const { container } = renderLayout(<div>Test</div>);
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  test('has proper z-index layering', () => {
    const { container } = renderLayout(<div>Test</div>);
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('relative', 'z-10');
  });
});