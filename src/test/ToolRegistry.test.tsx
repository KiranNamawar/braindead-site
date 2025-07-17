import { describe, it, expect } from 'vitest';
import { toolRegistry } from '../utils/toolRegistry';

describe('Tool Registry - Number Conversion Tools', () => {
  it('should have number-converter tool registered', () => {
    const tool = toolRegistry.getTool('number-converter');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('Number Base Converter');
    expect(tool?.category).toBe('number-conversion');
    expect(tool?.path).toBe('/number-converter');
    expect(tool?.isNew).toBe(true);
  });

  it('should have roman-numeral tool registered', () => {
    const tool = toolRegistry.getTool('roman-numeral');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('Roman Numeral Converter');
    expect(tool?.category).toBe('number-conversion');
    expect(tool?.path).toBe('/roman-numeral');
    expect(tool?.isNew).toBe(true);
  });

  it('should have number-conversion category with both tools', () => {
    const categoryTools = toolRegistry.getToolsByCategory('number-conversion' as any);
    expect(categoryTools.length).toBeGreaterThanOrEqual(2);
    
    const toolIds = categoryTools.map(tool => tool.id);
    expect(toolIds).toContain('number-converter');
    expect(toolIds).toContain('roman-numeral');
  });

  it('should find tools by search', () => {
    const binaryResults = toolRegistry.searchTools('binary');
    expect(binaryResults.some(tool => tool.id === 'number-converter')).toBe(true);

    const romanResults = toolRegistry.searchTools('roman');
    expect(romanResults.some(tool => tool.id === 'roman-numeral')).toBe(true);
  });

  it('should find tools by shortcuts', () => {
    const binaryResults = toolRegistry.searchTools('binary');
    expect(binaryResults.some(tool => tool.id === 'number-converter')).toBe(true);

    const romanResults = toolRegistry.searchTools('roman');
    expect(romanResults.some(tool => tool.id === 'roman-numeral')).toBe(true);
  });
});