import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG } from '../utils/constants';
import { 
  generateToolSEO, 
  generateHomepageSEO, 
  generateBreadcrumbStructuredData,
  generateToolFAQStructuredData,
  generateOrganizationStructuredData,
  SEOData 
} from '../utils/seo';
import { 
  generateToolMetaTags, 
  generateHomepageMetaTags, 
  generateCategoryMetaTags,
  MetaTags 
} from '../utils/seoMetaTags';
import { ToolCategory } from '../types';
import { getAllTools } from '../utils/toolRegistry';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
  keywords?: string | string[];
  noIndex?: boolean;
  toolId?: string;
  customSEOData?: Partial<SEOData>;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  keywords,
  noIndex = false,
  toolId,
  customSEOData
}) => {
  const location = useLocation();
  const allTools = getAllTools();
  
  // Generate comprehensive meta tags based on context
  let metaTags: MetaTags;
  let seoData: SEOData;
  
  if (toolId) {
    // Tool-specific SEO
    metaTags = generateToolMetaTags(toolId);
    const tool = allTools.find(t => t.id === toolId);
    if (tool) {
      seoData = generateToolSEO(tool);
    } else {
      seoData = generateHomepageSEO();
    }
  } else if (location.pathname === '/') {
    // Homepage SEO
    metaTags = generateHomepageMetaTags();
    seoData = generateHomepageSEO();
  } else {
    // Try to detect tool from path
    const pathTool = allTools.find(t => t.path === location.pathname);
    if (pathTool) {
      metaTags = generateToolMetaTags(pathTool.id);
      seoData = generateToolSEO(pathTool);
    } else {
      metaTags = generateHomepageMetaTags();
      seoData = generateHomepageSEO();
    }
  }
  
  // Override with custom data if provided
  if (customSEOData) {
    seoData = { ...seoData, ...customSEOData };
  }
  
  // Override with props if provided (prioritize new meta tags system)
  const finalTitle = title || metaTags.title;
  const finalDescription = description || metaTags.description;
  const finalCanonical = canonical ? `${APP_CONFIG.url}${canonical}` : metaTags.canonicalUrl;
  const finalImage = image ? (image.startsWith('http') ? image : `${APP_CONFIG.url}${image}`) : metaTags.ogImage || seoData.image;
  const finalKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords || metaTags.keywords;
  
  // Generate additional structured data
  const breadcrumbData = seoData.breadcrumbs ? generateBreadcrumbStructuredData(seoData.breadcrumbs) : null;
  const organizationData = generateOrganizationStructuredData();
  
  // Generate FAQ data for tools
  const tool = toolId ? allTools.find(t => t.id === toolId) : null;
  const faqData = tool ? generateToolFAQStructuredData(tool) : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={APP_CONFIG.author} />
      <meta name="version" content={APP_CONFIG.version} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content={seoData.type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:site_name" content={APP_CONFIG.name} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />

      {/* Main Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(metaTags.structuredData)}
      </script>

      {/* Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>

      {/* Breadcrumb Structured Data */}
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}

      {/* FAQ Structured Data for Tools */}
      {faqData && (
        <script type="application/ld+json">
          {JSON.stringify(faqData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;