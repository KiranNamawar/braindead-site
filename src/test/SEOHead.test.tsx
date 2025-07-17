import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const renderSEOHead = (props = {}) => {
  return render(
    <BrowserRouter>
      <SEOHead {...props} />
    </BrowserRouter>
  );
};

describe('SEOHead', () => {
  test('sets default title', () => {
    renderSEOHead();
    expect(document.title).toBe('BrainDead.site - Premium Utility Tools for Effortless Productivity');
  });

  test('sets custom title', () => {
    renderSEOHead({ title: 'Custom Title' });
    expect(document.title).toBe('Custom Title | BrainDead.site');
  });

  test('sets meta description', () => {
    renderSEOHead({ description: 'Custom description' });
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription?.getAttribute('content')).toBe('Custom description');
  });

  test('sets canonical URL', () => {
    renderSEOHead({ canonical: '/test-page' });
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink?.getAttribute('href')).toBe('https://braindead.site/test-page');
  });

  test('sets Open Graph tags', () => {
    renderSEOHead({ 
      title: 'Test Title',
      description: 'Test Description',
      image: '/test-image.jpg'
    });
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    expect(ogTitle?.getAttribute('content')).toBe('Test Title | BrainDead.site');
    expect(ogDescription?.getAttribute('content')).toBe('Test Description');
    expect(ogImage?.getAttribute('content')).toBe('https://braindead.site/test-image.jpg');
  });

  test('sets Twitter Card tags', () => {
    renderSEOHead({ 
      title: 'Test Title',
      description: 'Test Description'
    });
    
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
    expect(twitterTitle?.getAttribute('content')).toBe('Test Title | BrainDead.site');
  });

  test('sets structured data', () => {
    renderSEOHead({ title: 'Test Tool' });
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    expect(structuredData).toBeInTheDocument();
    
    const jsonData = JSON.parse(structuredData?.textContent || '{}');
    expect(jsonData['@type']).toBe('WebApplication');
    expect(jsonData.name).toBe('BrainDead.site');
  });
});