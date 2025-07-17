import React from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_CONFIG } from '../utils/constants';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
  keywords?: string;
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = APP_CONFIG.description,
  canonical,
  image = '/og-image.jpg',
  type = 'website',
  keywords = 'utility tools, calculator, color picker, QR generator, password generator, text tools, hash generator, JSON formatter, unit converter, timestamp converter, image optimizer, random generator',
  noIndex = false
}) => {
  const siteTitle = `${APP_CONFIG.name} - Premium Utility Tools for Effortless Productivity`;
  const fullTitle = title ? `${title} | ${APP_CONFIG.name}` : siteTitle;
  const fullCanonical = canonical ? `${APP_CONFIG.url}${canonical}` : APP_CONFIG.url;
  const fullImage = image.startsWith('http') ? image : `${APP_CONFIG.url}${image}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: APP_CONFIG.name,
    description,
    url: APP_CONFIG.url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    creator: {
      '@type': 'Organization',
      name: APP_CONFIG.author,
      url: APP_CONFIG.url
    },
    featureList: [
      'Calculator with history',
      'Color picker and palette generator',
      'QR code generator',
      'Text transformation tools',
      'Password generator',
      'Hash generator',
      'Image optimizer',
      'Timestamp converter',
      'JSON formatter',
      'Random data generator',
      'Unit converter'
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={APP_CONFIG.author} />
      <meta name="version" content={APP_CONFIG.version} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content={APP_CONFIG.name} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#1f2937" />
      <meta name="msapplication-TileColor" content="#1f2937" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;