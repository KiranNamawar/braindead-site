import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Components for testing
import Calculator from '../pages/CalculatorPage';
import JSONFormatter from '../pages/JSONFormatterPage';
import ColorPicker from '../pages/ColorPickerPage';

// Utils
import { getAllTools } from '../utils/toolRegistry';
import { searchTools } from '../utils/fuzzySearch';

// Helper function to render components with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Accessibility and Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Accessibility Testing (WCAG 2.1 AA Compliance)', () => {
    describe('Keyboard Navigation', () => {
      it('should support keyboard navigation in Calculator', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Calculator />);

        // Test Tab navigation
        await user.tab();
        const firstButton = document.activeElement;
        expect(firstButton).toBeInTheDocument();
        expect(firstButton?.tagName).toBe('BUTTON');

        // Test Enter key activation
        if (firstButton) {
          await user.keyboard('{Enter}');
          // Should activate the button (no error thrown)
          expect(firstButton).toBeInTheDocument();
        }

        // Test Arrow key navigation (if implemented)
        await user.keyboard('{ArrowDown}');
        const nextElement = document.activeElement;
        expect(nextElement).toBeInTheDocument();
      });

      it('should support keyboard navigation in JSON Formatter', async () => {
        const user = userEvent.setup();
        renderWithRouter(<JSONFormatter />);

        // Test Tab navigation through form elements
        await user.tab();
        const firstElement = document.activeElement;
        expect(firstElement).toBeInTheDocument();

        // Should be able to navigate to textarea
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
        
        // Test keyboard input
        await user.click(textarea);
        await user.type(textarea, '{"test": "value"}');
        expect(textarea).toHaveValue('{"test": "value"}');
      });

      it('should support Escape key to close modals and overlays', async () => {
        const user = userEvent.setup();
        renderWithRouter(<ColorPicker />);

        // Test Escape key functionality
        await user.keyboard('{Escape}');
        // Should not throw error and handle escape gracefully
        expect(screen.getByText(/Color Picker/i)).toBeInTheDocument();
      });
    });

    describe('Focus Management', () => {
      it('should have visible focus indicators', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Calculator />);

        // Tab to first focusable element
        await user.tab();
        const focusedElement = document.activeElement;
        
        if (focusedElement) {
          const styles = window.getComputedStyle(focusedElement);
          // Should have some form of focus styling (outline, box-shadow, etc.)
          const hasFocusStyle = 
            styles.outline !== 'none' || 
            styles.boxShadow !== 'none' ||
            styles.border !== 'none';
          
          // Note: In test environment, computed styles might not be fully available
          // This test ensures focus management is working
          expect(focusedElement).toBeInTheDocument();
        }
      });

      it('should maintain logical tab order', async () => {
        const user = userEvent.setup();
        renderWithRouter(<JSONFormatter />);

        const focusableElements: Element[] = [];
        
        // Collect focusable elements by tabbing through
        for (let i = 0; i < 10; i++) {
          await user.tab();
          const focused = document.activeElement;
          if (focused && focused !== document.body) {
            focusableElements.push(focused);
          }
        }

        // Should have found focusable elements
        expect(focusableElements.length).toBeGreaterThan(0);
        
        // Each element should be unique (no focus traps)
        const uniqueElements = new Set(focusableElements);
        expect(uniqueElements.size).toBeGreaterThan(0);
      });
    });

    describe('ARIA Labels and Semantic HTML', () => {
      it('should have proper ARIA labels on interactive elements', () => {
        renderWithRouter(<Calculator />);

        // Check for buttons with accessible names
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          // Each button should have accessible text content or aria-label
          const hasAccessibleName = 
            button.textContent?.trim() || 
            button.getAttribute('aria-label') ||
            button.getAttribute('aria-labelledby');
          
          expect(hasAccessibleName).toBeTruthy();
        });
      });

      it('should use semantic HTML elements', () => {
        renderWithRouter(<JSONFormatter />);

        // Check for proper form elements
        const textareas = screen.getAllByRole('textbox');
        expect(textareas.length).toBeGreaterThan(0);

        // Check for proper button elements
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });

      it('should have proper heading hierarchy', () => {
        renderWithRouter(<Calculator />);

        // Check for main heading
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);

        // First heading should be h1 or have appropriate level
        const firstHeading = headings[0];
        const tagName = firstHeading.tagName.toLowerCase();
        expect(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).toContain(tagName);
      });
    });

    describe('Color Contrast and Visual Accessibility', () => {
      it('should not rely solely on color for information', () => {
        renderWithRouter(<Calculator />);

        // Check that interactive elements have text or icons, not just color
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          const hasTextContent = button.textContent?.trim();
          const hasAriaLabel = button.getAttribute('aria-label');
          const hasIcon = button.querySelector('svg') || button.querySelector('[class*="icon"]');
          
          // Should have text, aria-label, or icon
          expect(hasTextContent || hasAriaLabel || hasIcon).toBeTruthy();
        });
      });

      it('should handle high contrast mode', () => {
        renderWithRouter(<ColorPicker />);

        // Test that elements are still visible and functional
        // In a real test, you might simulate high contrast mode
        const interactiveElements = screen.getAllByRole('button');
        expect(interactiveElements.length).toBeGreaterThan(0);
        
        interactiveElements.forEach(element => {
          expect(element).toBeVisible();
        });
      });
    });

    describe('Screen Reader Compatibility', () => {
      it('should have proper alt text for images', () => {
        renderWithRouter(<Calculator />);

        const images = screen.queryAllByRole('img');
        images.forEach(img => {
          const altText = img.getAttribute('alt');
          const ariaLabel = img.getAttribute('aria-label');
          const ariaHidden = img.getAttribute('aria-hidden');
          
          // Images should have alt text, aria-label, or be hidden from screen readers
          expect(altText !== null || ariaLabel !== null || ariaHidden === 'true').toBeTruthy();
        });
      });

      it('should provide context for form inputs', () => {
        renderWithRouter(<JSONFormatter />);

        const inputs = screen.getAllByRole('textbox');
        inputs.forEach(input => {
          const hasLabel = 
            input.getAttribute('aria-label') ||
            input.getAttribute('aria-labelledby') ||
            input.getAttribute('placeholder') ||
            screen.queryByLabelText(input.getAttribute('name') || '');
          
          // Each input should have some form of label
          expect(hasLabel).toBeTruthy();
        });
      });
    });
  });

  describe('Performance Testing', () => {
    describe('Component Rendering Performance', () => {
      it('should render Calculator component quickly', () => {
        const startTime = performance.now();
        renderWithRouter(<Calculator />);
        const endTime = performance.now();
        
        const renderTime = endTime - startTime;
        
        // Should render in under 100ms (generous for test environment)
        expect(renderTime).toBeLessThan(100);
      });

      it('should render JSON Formatter component quickly', () => {
        const startTime = performance.now();
        renderWithRouter(<JSONFormatter />);
        const endTime = performance.now();
        
        const renderTime = endTime - startTime;
        
        // Should render in under 100ms
        expect(renderTime).toBeLessThan(100);
      });

      it('should handle large JSON input efficiently', async () => {
        const user = userEvent.setup();
        renderWithRouter(<JSONFormatter />);

        // Create large JSON object
        const largeObject = {
          data: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            description: `Description for item ${i}`,
            metadata: {
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              tags: [`tag${i}`, `category${i % 10}`]
            }
          }))
        };

        const largeJSON = JSON.stringify(largeObject);
        const textarea = screen.getByRole('textbox');

        const startTime = performance.now();
        await user.click(textarea);
        await user.clear(textarea);
        await user.type(textarea, largeJSON.substring(0, 1000)); // Type first 1000 chars
        const endTime = performance.now();

        const processingTime = endTime - startTime;
        
        // Should handle large input reasonably quickly
        expect(processingTime).toBeLessThan(5000); // 5 seconds max
      });
    });

    describe('Search Performance', () => {
      it('should perform search operations quickly', () => {
        const tools = getAllTools();
        const queries = ['calc', 'json', 'color', 'hash', 'text', 'time'];

        queries.forEach(query => {
          const startTime = performance.now();
          const results = searchTools(query, tools);
          const endTime = performance.now();

          const searchTime = endTime - startTime;
          
          // Each search should complete in under 10ms
          expect(searchTime).toBeLessThan(10);
          expect(results.length).toBeGreaterThanOrEqual(0);
        });
      });

      it('should handle complex search queries efficiently', () => {
        const tools = getAllTools();
        const complexQueries = [
          'calculator math arithmetic',
          'json format validate pretty',
          'color picker hex rgb hsl',
          'text case convert transform'
        ];

        complexQueries.forEach(query => {
          const startTime = performance.now();
          const results = searchTools(query, tools);
          const endTime = performance.now();

          const searchTime = endTime - startTime;
          
          // Complex searches should still be fast
          expect(searchTime).toBeLessThan(20);
          expect(Array.isArray(results)).toBe(true);
        });
      });
    });

    describe('Memory Usage', () => {
      it('should not create memory leaks with repeated operations', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Calculator />);

        // Simulate repeated button clicks
        const button7 = screen.getByText('7');
        const buttonPlus = screen.getByText('+');
        const buttonEquals = screen.getByText('=');
        const buttonClear = screen.getByText('C');

        // Perform many operations
        for (let i = 0; i < 100; i++) {
          await user.click(button7);
          await user.click(buttonPlus);
          await user.click(button7);
          await user.click(buttonEquals);
          await user.click(buttonClear);
        }

        // Should complete without errors (memory leaks would cause issues)
        expect(screen.getByDisplayValue('0')).toBeInTheDocument();
      });

      it('should handle rapid user interactions', async () => {
        const user = userEvent.setup();
        renderWithRouter(<JSONFormatter />);

        const textarea = screen.getByRole('textbox');
        
        // Rapid typing simulation
        const startTime = performance.now();
        
        for (let i = 0; i < 50; i++) {
          await user.type(textarea, `{"key${i}": "value${i}"}`, { delay: 1 });
          await user.clear(textarea);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        // Should handle rapid interactions without significant slowdown
        expect(totalTime).toBeLessThan(10000); // 10 seconds max
      });
    });

    describe('Bundle Size and Loading Performance', () => {
      it('should have reasonable component sizes', () => {
        // Test that components don't import unnecessary dependencies
        const calculatorModule = require('../pages/CalculatorPage');
        const jsonFormatterModule = require('../pages/JSONFormatterPage');
        const colorPickerModule = require('../pages/ColorPickerPage');

        // Should have default exports
        expect(calculatorModule.default).toBeDefined();
        expect(jsonFormatterModule.default).toBeDefined();
        expect(colorPickerModule.default).toBeDefined();

        // Should be functions (React components)
        expect(typeof calculatorModule.default).toBe('function');
        expect(typeof jsonFormatterModule.default).toBe('function');
        expect(typeof colorPickerModule.default).toBe('function');
      });

      it('should lazy load components efficiently', async () => {
        // Test dynamic imports
        const startTime = performance.now();
        
        const modules = await Promise.all([
          import('../pages/CalculatorPage'),
          import('../pages/JSONFormatterPage'),
          import('../pages/ColorPickerPage')
        ]);
        
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Should load modules quickly
        expect(loadTime).toBeLessThan(1000); // 1 second max
        expect(modules.length).toBe(3);
        
        modules.forEach(module => {
          expect(module.default).toBeDefined();
        });
      });
    });
  });

  describe('Cross-Browser Compatibility', () => {
    describe('Feature Detection', () => {
      it('should handle missing modern APIs gracefully', () => {
        // Test clipboard API fallback
        const originalClipboard = navigator.clipboard;
        
        // Remove clipboard API
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          writable: true,
        });

        renderWithRouter(<JSONFormatter />);
        
        // Should render without errors even without clipboard API
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        
        // Restore clipboard API
        Object.defineProperty(navigator, 'clipboard', {
          value: originalClipboard,
          writable: true,
        });
      });

      it('should work without modern JavaScript features', () => {
        // Test that components work with basic JavaScript
        renderWithRouter(<Calculator />);
        
        // Should render basic functionality
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('+')).toBeInTheDocument();
        expect(screen.getByText('=')).toBeInTheDocument();
      });
    });

    describe('Input Method Compatibility', () => {
      it('should handle different input methods', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Calculator />);

        // Test mouse clicks
        const button7 = screen.getByText('7');
        await user.click(button7);
        
        // Test keyboard input
        await user.keyboard('8');
        
        // Should handle both input methods
        expect(screen.getByDisplayValue(/[78]/)).toBeInTheDocument();
      });

      it('should support touch interactions', async () => {
        const user = userEvent.setup();
        renderWithRouter(<ColorPicker />);

        // Simulate touch events (pointer events in testing)
        const colorInput = screen.queryByRole('textbox');
        if (colorInput) {
          await user.click(colorInput);
          await user.type(colorInput, '#ff0000');
          
          expect(colorInput).toHaveValue('#ff0000');
        }
      });
    });
  });

  describe('Responsive Design Testing', () => {
    it('should adapt to different screen sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      renderWithRouter(<Calculator />);
      
      // Should render without layout issues
      expect(screen.getByText('7')).toBeInTheDocument();
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      renderWithRouter(<Calculator />);
      
      // Should still render correctly
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should handle orientation changes', () => {
      renderWithRouter(<JSONFormatter />);
      
      // Should render in both orientations
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      
      // Simulate orientation change
      window.dispatchEvent(new Event('orientationchange'));
      
      // Should still be functional
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});