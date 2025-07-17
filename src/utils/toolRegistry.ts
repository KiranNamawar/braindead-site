// Tool registry and management utilities
import { Tool, ToolCategory } from '../types';

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private categories: Map<ToolCategory, Tool[]> = new Map();
  private shortcuts: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaultTools();
    this.setupShortcuts();
  }

  private initializeDefaultTools(): void {
    // Existing tools (enhanced with new properties)
    const existingTools: Tool[] = [
      {
        id: 'calculator',
        name: 'Calculator',
        description: 'Basic calculator for everyday math',
        sarcasticQuote: 'Because mental math is apparently too hard',
        path: '/calculator',
        icon: 'Calculator',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        category: ToolCategory.CALCULATOR,
        features: ['Basic operations', 'History', 'Keyboard support'],
        keywords: ['math', 'calculate', 'arithmetic', 'numbers'],
        shortcuts: ['calc', 'math'],
        isPremium: false,
        estimatedTimeSaved: 2
      },
      {
        id: 'color-picker',
        name: 'Color Picker',
        description: 'Pick and convert colors between formats',
        sarcasticQuote: 'For when you need that perfect shade of disappointment',
        path: '/color-picker',
        icon: 'Palette',
        gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
        category: ToolCategory.CREATIVE_DESIGN,
        features: ['HEX, RGB, HSL conversion', 'Color palette', 'Eyedropper'],
        keywords: ['color', 'hex', 'rgb', 'hsl', 'palette'],
        shortcuts: ['color', 'hex'],
        isPremium: false,
        estimatedTimeSaved: 5
      },
      {
        id: 'qr-generator',
        name: 'QR Code Generator',
        description: 'Generate QR codes for text, URLs, and more',
        sarcasticQuote: 'Turn text into mysterious squares that somehow work',
        path: '/qr-generator',
        icon: 'QrCode',
        gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        category: ToolCategory.UTILITY,
        features: ['Custom size', 'Error correction', 'Download PNG'],
        keywords: ['qr', 'code', 'generator', 'url', 'text'],
        shortcuts: ['qr', 'code'],
        isPremium: false,
        estimatedTimeSaved: 3
      },
      {
        id: 'text-tools',
        name: 'Text Tools',
        description: 'Transform and manipulate text in various ways',
        sarcasticQuote: 'Because sometimes text needs therapy too',
        path: '/text-tools',
        icon: 'Type',
        gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        category: ToolCategory.TEXT_WRITING,
        features: ['Case conversion', 'Text cleaning', 'Character count'],
        keywords: ['text', 'case', 'convert', 'clean', 'format'],
        shortcuts: ['text', 'case'],
        isPremium: false,
        estimatedTimeSaved: 4
      },
      {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure passwords with custom options',
        sarcasticQuote: 'Creating passwords stronger than your willpower',
        path: '/password-generator',
        icon: 'Key',
        gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
        category: ToolCategory.UTILITY,
        features: ['Custom length', 'Character sets', 'Strength meter'],
        keywords: ['password', 'secure', 'generate', 'random'],
        shortcuts: ['pass', 'password'],
        isPremium: false,
        estimatedTimeSaved: 2
      },
      {
        id: 'hash-generator',
        name: 'Hash Generator',
        description: 'Generate MD5, SHA-1, SHA-256 hashes',
        sarcasticQuote: 'Turn your secrets into unreadable gibberish',
        path: '/hash-generator',
        icon: 'Hash',
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        category: ToolCategory.DEVELOPER,
        features: ['Multiple algorithms', 'File hashing', 'Comparison'],
        keywords: ['hash', 'md5', 'sha', 'checksum', 'crypto'],
        shortcuts: ['hash', 'md5', 'sha'],
        isPremium: false,
        estimatedTimeSaved: 3
      },
      {
        id: 'image-optimizer',
        name: 'Image Optimizer',
        description: 'Compress and optimize images',
        sarcasticQuote: 'Making your photos diet-friendly',
        path: '/image-optimizer',
        icon: 'Image',
        gradient: 'linear-gradient(135deg, #10b981, #22c55e)',
        category: ToolCategory.CREATIVE_DESIGN,
        features: ['Lossless compression', 'Format conversion', 'Batch processing'],
        keywords: ['image', 'compress', 'optimize', 'resize'],
        shortcuts: ['img', 'compress'],
        isPremium: false,
        estimatedTimeSaved: 10
      },
      {
        id: 'timestamp-converter',
        name: 'Timestamp Converter',
        description: 'Convert between timestamps and human-readable dates',
        sarcasticQuote: 'Because computers and humans disagree on time',
        path: '/timestamp-converter',
        icon: 'Clock',
        gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
        category: ToolCategory.TIME_PRODUCTIVITY,
        features: ['Unix timestamp', 'Multiple formats', 'Timezone support'],
        keywords: ['timestamp', 'unix', 'date', 'time', 'convert'],
        shortcuts: ['time', 'timestamp'],
        isPremium: false,
        estimatedTimeSaved: 3
      },
      {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format, validate, and minify JSON data',
        sarcasticQuote: 'Making JSON readable by humans again',
        path: '/json-formatter',
        icon: 'Braces',
        gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
        category: ToolCategory.DEVELOPER,
        features: ['Pretty print', 'Validation', 'Minification'],
        keywords: ['json', 'format', 'validate', 'pretty', 'minify'],
        shortcuts: ['json', 'format'],
        isPremium: false,
        estimatedTimeSaved: 5
      },
      {
        id: 'random-generator',
        name: 'Random Generator',
        description: 'Generate random numbers, strings, and UUIDs',
        sarcasticQuote: 'For when life needs more chaos',
        path: '/random-generator',
        icon: 'Shuffle',
        gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
        category: ToolCategory.UTILITY,
        features: ['Numbers', 'Strings', 'UUIDs', 'Custom ranges'],
        keywords: ['random', 'generate', 'uuid', 'number', 'string'],
        shortcuts: ['random', 'uuid'],
        isPremium: false,
        estimatedTimeSaved: 2
      },
      {
        id: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between different units of measurement',
        sarcasticQuote: 'Because the metric system makes too much sense',
        path: '/unit-converter',
        icon: 'Scale',
        gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
        category: ToolCategory.NUMBER_CONVERSION,
        features: ['Length', 'Weight', 'Temperature', 'Volume'],
        keywords: ['unit', 'convert', 'metric', 'imperial', 'measurement'],
        shortcuts: ['unit', 'convert'],
        isPremium: false,
        estimatedTimeSaved: 3
      },
      {
        id: 'loan-calculator',
        name: 'Loan Calculator',
        description: 'Calculate loan payments and generate amortization schedules',
        sarcasticQuote: 'See how broke you\'ll be for the next 30 years',
        path: '/loan-calculator',
        icon: 'Calculator',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        category: ToolCategory.EVERYDAY_LIFE,
        features: ['Payment calculations', 'Amortization schedule', 'Interest breakdown', 'Export CSV'],
        keywords: ['loan', 'mortgage', 'payment', 'interest', 'amortization', 'finance'],
        shortcuts: ['loan', 'mortgage'],
        isPremium: false,
        estimatedTimeSaved: 15
      },
      {
        id: 'percentage-calculator',
        name: 'Percentage Calculator',
        description: 'Calculate percentages, increases, decreases, and percentage changes',
        sarcasticQuote: 'Because mental math is overrated',
        path: '/percentage-calculator',
        icon: 'Percent',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        category: ToolCategory.EVERYDAY_LIFE,
        features: ['Multiple calculation types', 'Clear explanations', 'Formula breakdowns', 'History tracking'],
        keywords: ['percentage', 'percent', 'increase', 'decrease', 'change', 'math', 'calculation'],
        shortcuts: ['percent', 'percentage', '%'],
        isPremium: false,
        estimatedTimeSaved: 5
      },
      {
        id: 'tip-calculator',
        name: 'Tip Calculator',
        description: 'Calculate tips and split bills with ease',
        sarcasticQuote: 'Calculate tips without looking cheap or overpaying',
        path: '/tip-calculator',
        icon: 'Calculator',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        category: ToolCategory.EVERYDAY_LIFE,
        features: ['Custom tip percentages', 'Bill splitting', 'Currency formatting', 'Rounding options'],
        keywords: ['tip', 'bill', 'split', 'restaurant', 'service', 'gratuity'],
        shortcuts: ['tip', 'bill'],
        isPremium: false,
        estimatedTimeSaved: 3
      },
      {
        id: 'age-calculator',
        name: 'Age Calculator',
        description: 'Calculate precise age and time differences',
        sarcasticQuote: 'Find out exactly how old you are (down to the second)',
        path: '/age-calculator',
        icon: 'Calendar',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        category: ToolCategory.EVERYDAY_LIFE,
        features: ['Precise calculations', 'Multiple date formats', 'Age comparison', 'Leap year handling'],
        keywords: ['age', 'birthday', 'date', 'time', 'years', 'months', 'days'],
        shortcuts: ['age', 'birthday'],
        isPremium: false,
        estimatedTimeSaved: 2
      },
      {
        id: 'bmi-calculator',
        name: 'BMI Calculator',
        description: 'Calculate Body Mass Index with health insights',
        sarcasticQuote: 'Health metrics without the gym membership guilt',
        path: '/bmi-calculator',
        icon: 'Activity',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        category: ToolCategory.EVERYDAY_LIFE,
        features: ['Metric and imperial units', 'BMI categories', 'Health indicators', 'Visual feedback'],
        keywords: ['bmi', 'health', 'weight', 'height', 'body', 'mass', 'index'],
        shortcuts: ['bmi', 'health'],
        isPremium: false,
        estimatedTimeSaved: 2
      },
      {
        id: 'grade-calculator',
        name: 'Grade Calculator',
        description: 'Calculate weighted grades and GPA',
        sarcasticQuote: 'Turn your academic anxiety into numbers',
        path: '/grade-calculator',
        icon: 'GraduationCap',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        category: ToolCategory.EVERYDAY_LIFE,
        features: ['Weighted calculations', 'GPA calculation', 'Grade scale customization', 'Grade prediction'],
        keywords: ['grade', 'gpa', 'school', 'academic', 'weighted', 'average'],
        shortcuts: ['grade', 'gpa'],
        isPremium: false,
        estimatedTimeSaved: 10
      }
    ];

    // Register existing tools
    existingTools.forEach(tool => this.registerTool(tool));
  }

  private setupShortcuts(): void {
    // Setup shortcuts for quick access
    this.tools.forEach(tool => {
      tool.shortcuts.forEach(shortcut => {
        this.shortcuts.set(shortcut.toLowerCase(), tool.id);
      });
    });
  }

  public registerTool(tool: Tool): void {
    this.tools.set(tool.id, tool);
    
    // Add to category
    const categoryTools = this.categories.get(tool.category) || [];
    categoryTools.push(tool);
    this.categories.set(tool.category, categoryTools);
    
    // Register shortcuts
    tool.shortcuts.forEach(shortcut => {
      this.shortcuts.set(shortcut.toLowerCase(), tool.id);
    });
  }

  public getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  public getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  public getToolsByCategory(category: ToolCategory): Tool[] {
    return this.categories.get(category) || [];
  }

  public getCategories(): ToolCategory[] {
    return Array.from(this.categories.keys());
  }

  public searchTools(query: string): Tool[] {
    const lowerQuery = query.toLowerCase();
    
    // Check shortcuts first
    const shortcutTool = this.shortcuts.get(lowerQuery);
    if (shortcutTool) {
      const tool = this.getTool(shortcutTool);
      return tool ? [tool] : [];
    }
    
    // Fuzzy search through tools
    const results: Array<{ tool: Tool; score: number }> = [];
    
    this.tools.forEach(tool => {
      let score = 0;
      
      // Name match (highest priority)
      if (tool.name.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
      
      // Description match
      if (tool.description.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
      
      // Keywords match
      tool.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowerQuery)) {
          score += 3;
        }
      });
      
      // Features match
      tool.features.forEach(feature => {
        if (feature.toLowerCase().includes(lowerQuery)) {
          score += 2;
        }
      });
      
      // Sarcastic quote match (for fun)
      if (tool.sarcasticQuote.toLowerCase().includes(lowerQuery)) {
        score += 1;
      }
      
      if (score > 0) {
        results.push({ tool, score });
      }
    });
    
    // Sort by score and return tools
    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.tool);
  }

  public getFeaturedTools(): Tool[] {
    // Return most popular/useful tools
    const featured = [
      'calculator',
      'json-formatter',
      'password-generator',
      'color-picker',
      'text-tools',
      'qr-generator'
    ];
    
    return featured
      .map(id => this.getTool(id))
      .filter((tool): tool is Tool => tool !== undefined);
  }

  public getNewTools(): Tool[] {
    return this.getAllTools().filter(tool => tool.isNew);
  }

  public getToolsByKeyword(keyword: string): Tool[] {
    return this.getAllTools().filter(tool =>
      tool.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  public suggestSimilarTools(toolId: string): Tool[] {
    const tool = this.getTool(toolId);
    if (!tool) return [];
    
    // Find tools in same category
    const categoryTools = this.getToolsByCategory(tool.category)
      .filter(t => t.id !== toolId);
    
    // Find tools with similar keywords
    const keywordTools = this.getAllTools().filter(t => {
      if (t.id === toolId) return false;
      return tool.keywords.some(keyword =>
        t.keywords.includes(keyword)
      );
    });
    
    // Combine and deduplicate
    const similar = [...categoryTools, ...keywordTools];
    const unique = Array.from(new Map(similar.map(t => [t.id, t])).values());
    
    return unique.slice(0, 4); // Return max 4 suggestions
  }

  public getToolStats(): {
    totalTools: number;
    toolsByCategory: Record<ToolCategory, number>;
    averageTimeSaved: number;
  } {
    const tools = this.getAllTools();
    const totalTools = tools.length;
    
    const toolsByCategory = {} as Record<ToolCategory, number>;
    Object.values(ToolCategory).forEach(category => {
      toolsByCategory[category] = this.getToolsByCategory(category).length;
    });
    
    const averageTimeSaved = tools.reduce((sum, tool) => sum + tool.estimatedTimeSaved, 0) / totalTools;
    
    return {
      totalTools,
      toolsByCategory,
      averageTimeSaved
    };
  }
}

// Create singleton instance
export const toolRegistry = new ToolRegistry();

// Convenience functions
export const registerTool = (tool: Tool) => toolRegistry.registerTool(tool);
export const getTool = (id: string) => toolRegistry.getTool(id);
export const getAllTools = () => toolRegistry.getAllTools();
export const getToolsByCategory = (category: ToolCategory) => toolRegistry.getToolsByCategory(category);
export const searchTools = (query: string) => toolRegistry.searchTools(query);
export const getFeaturedTools = () => toolRegistry.getFeaturedTools();
export const getNewTools = () => toolRegistry.getNewTools();
export const suggestSimilarTools = (toolId: string) => toolRegistry.suggestSimilarTools(toolId);
export const getToolStats = () => toolRegistry.getToolStats();