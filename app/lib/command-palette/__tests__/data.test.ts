import { describe, it, expect } from 'vitest';
import { sampleUtilities } from '../data';
import { Utility } from '../../types';

describe('Utility Type and Sample Data', () => {
  it('should have valid sample utilities data', () => {
    expect(sampleUtilities).toBeDefined();
    expect(Array.isArray(sampleUtilities)).toBe(true);
    expect(sampleUtilities.length).toBeGreaterThan(0);
  });

  it('should have utilities with all required properties', () => {
    sampleUtilities.forEach((utility: Utility) => {
      expect(utility).toHaveProperty('id');
      expect(utility).toHaveProperty('name');
      expect(utility).toHaveProperty('description');
      expect(utility).toHaveProperty('category');
      expect(utility).toHaveProperty('tags');
      expect(utility).toHaveProperty('path');
      
      // Check property types
      expect(typeof utility.id).toBe('string');
      expect(typeof utility.name).toBe('string');
      expect(typeof utility.description).toBe('string');
      expect(typeof utility.category).toBe('string');
      expect(Array.isArray(utility.tags)).toBe(true);
      expect(typeof utility.path).toBe('string');
    });
  });

  it('should have unique IDs for all utilities', () => {
    const ids = sampleUtilities.map(utility => utility.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid categories', () => {
    const validCategories = [
      'Text Tools',
      'Developer Tools',
      'Image Tools',
      'Productivity Tools',
      'Fun Tools'
    ];
    
    sampleUtilities.forEach(utility => {
      expect(validCategories).toContain(utility.category);
    });
  });

  it('should have non-empty tags array for each utility', () => {
    sampleUtilities.forEach(utility => {
      expect(utility.tags.length).toBeGreaterThan(0);
      utility.tags.forEach(tag => {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have valid paths starting with /tools/', () => {
    sampleUtilities.forEach(utility => {
      expect(utility.path).toMatch(/^\/tools\//);
    });
  });
});