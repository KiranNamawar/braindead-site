# Component Usage Patterns

## shadcn/ui Component Implementation

### Installation & Setup
```bash
# Add a component
bunx shadcn@latest add button

# Add multiple components
bunx shadcn@latest add button card form input
```

### Component Categories

#### Layout Components
- **Card**: Container for utility tools and content sections
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle>Text Formatter</CardTitle>
      <CardDescription>Format and transform text easily</CardDescription>
    </CardHeader>
    <CardContent>{/* Tool content */}</CardContent>
    <CardFooter>{/* Actions */}</CardFooter>
  </Card>
  ```

- **Tabs**: Organize related content within a utility
  ```tsx
  <Tabs defaultValue="format">
    <TabsList>
      <TabsTrigger value="format">Format</TabsTrigger>
      <TabsTrigger value="transform">Transform</TabsTrigger>
    </TabsList>
    <TabsContent value="format">{/* Format content */}</TabsContent>
    <TabsContent value="transform">{/* Transform content */}</TabsContent>
  </Tabs>
  ```

- **Accordion**: Collapsible sections for instructions or FAQs
  ```tsx
  <Accordion type="single" collapsible>
    <AccordionItem value="instructions">
      <AccordionTrigger>How to use</AccordionTrigger>
      <AccordionContent>
        {/* Instructions content */}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  ```

#### Navigation Components
- **NavigationMenu**: Main site navigation
  ```tsx
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Text Tools</NavigationMenuTrigger>
        <NavigationMenuContent>
          {/* Dropdown content */}
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
  ```

- **Breadcrumb**: Page hierarchy navigation
  ```tsx
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/text">Text Tools</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
  ```

#### Form Components
- **Form with React Hook Form and Zod**:
  ```tsx
  const formSchema = z.object({
    text: z.string().min(1, "Text is required"),
  });

  export function TextForm() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { text: "" },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Text</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Process</Button>
        </form>
      </Form>
    );
  }
  ```

#### Feedback Components
- **Alert**: Important messages
  ```tsx
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Note</AlertTitle>
    <AlertDescription>
      This tool processes data client-side for privacy.
    </AlertDescription>
  </Alert>
  ```

- **Toast Notifications**: Transient feedback with Sonner
  ```tsx
  import { toast } from "sonner";

  // In component
  <Button onClick={() => toast.success("Text copied to clipboard")}>
    Copy
  </Button>
  ```

#### Dialog Components
- **Dialog**: Modal windows for important interactions
  ```tsx
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Settings</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tool Settings</DialogTitle>
        <DialogDescription>
          Adjust settings for this utility.
        </DialogDescription>
      </DialogHeader>
      {/* Settings content */}
      <DialogFooter>
        <Button>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  ```

#### Data Display Components
- **DataTable**: For tabular data display
  ```tsx
  <DataTable columns={columns} data={data} />
  ```

- **Chart**: Data visualization
  ```tsx
  <Chart
    type="bar"
    data={chartData}
    options={chartOptions}
  />
  ```

## Common Component Patterns

### Tool Layout Pattern
```tsx
export function TextUtility() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Text Formatter</h1>
        <p className="text-muted-foreground">Format and transform text easily</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Input form */}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">Copy</Button>
              <Button size="sm" variant="outline">Download</Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Output display */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Responsive Layout Pattern
```tsx
<div className="container py-8">
  <div className="grid gap-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_240px]">
    <aside className="hidden lg:block">
      {/* Sidebar navigation */}
      <Sidebar />
    </aside>
    
    <main className="min-h-screen">
      {/* Main content */}
    </main>
    
    <aside className="hidden xl:block">
      {/* Related tools */}
    </aside>
  </div>
</div>
```

### Form with Real-time Processing
```tsx
export function TextTransformer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  
  // Process input in real-time
  useEffect(() => {
    setOutput(processText(input));
  }, [input]);
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Label htmlFor="input">Input</Label>
        <Textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to transform..."
          className="min-h-[200px]"
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="output">Output</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(output);
              toast.success("Copied to clipboard");
            }}
          >
            Copy
          </Button>
        </div>
        <Textarea
          id="output"
          value={output}
          readOnly
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
}
```

## External Library Integration Patterns

### Text Processing with Libraries
```tsx
import { marked } from "marked";
import DOMPurify from "dompurify";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const html = DOMPurify.sanitize(marked(markdown));
  
  return (
    <div 
      className="prose dark:prose-invert max-w-none" 
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

### Data Visualization with Chart.js
```tsx
import { Chart } from "~/components/ui/chart";

export function DataVisualizer({ data }: { data: DataPoint[] }) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: "Values",
        data: data.map(d => d.value),
        backgroundColor: "hsl(var(--primary))",
      },
    ],
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart type="bar" data={chartData} />
      </CardContent>
    </Card>
  );
}
```

### Form Validation with Zod
```tsx
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });
  
  function onSubmit(data: z.infer<typeof formSchema>) {
    // Process form data
    toast.success("Form submitted successfully!");
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## Accessibility Patterns

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Use proper focus management with visible focus indicators
- Implement keyboard shortcuts for power users

### Screen Reader Support
- Use proper ARIA attributes on all components
- Provide descriptive labels for form controls
- Use announcements for dynamic content changes

### Color Contrast
- Ensure all text meets WCAG 2.1 AA contrast requirements
- Provide sufficient contrast for UI elements
- Test with color blindness simulators

### Motion Sensitivity
```tsx
// In your CSS
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// In your React components
const prefersReducedMotion = 
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

<AnimatePresence mode={prefersReducedMotion ? "wait" : "sync"}>
  {/* Content */}
</AnimatePresence>
```## Search 
Implementation

### Command Component for Site-wide Search
The Command component from shadcn/ui provides a modern command palette interface for searching utilities and navigating the site.

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

// Define utility data structure
interface Utility {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  path: string;
}

// Sample utilities data
const utilities: Utility[] = [
  // Text Tools
  {
    id: "text-case-converter",
    name: "Case Converter",
    description: "Convert text between different cases",
    category: "Text Tools",
    tags: ["text", "case", "uppercase", "lowercase", "title case"],
    path: "/tools/text/case-converter",
  },
  // More utilities...
];

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(utilities, {
    keys: ["name", "description", "tags", "category"],
    threshold: 0.3,
    includeScore: true,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (utility: Utility) => {
    navigate(utility.path);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center w-full max-w-sm gap-2 px-4 py-2 text-sm border rounded-md bg-background"
      >
        <span className="text-muted-foreground">Search utilities...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search utilities..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Recent Searches */}
          <CommandGroup heading="Recent">
            {/* Recent searches would be dynamically populated */}
            <CommandItem onSelect={() => handleSelect(utilities[0])}>
              {utilities[0].name}
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          {/* Categories */}
          <CommandGroup heading="Text Tools">
            {utilities
              .filter(util => util.category === "Text Tools")
              .map(util => (
                <CommandItem key={util.id} onSelect={() => handleSelect(util)}>
                  {util.name}
                  <CommandShortcut>{util.category}</CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
          
          {/* More categories... */}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

### Search Results Page
For more advanced search functionality, implement a dedicated search results page:

```tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Utility[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(utilities, {
    keys: ["name", "description", "tags", "category"],
    threshold: 0.3,
    includeScore: true,
  });
  
  useEffect(() => {
    if (query) {
      const searchResults = fuse.search(query);
      setResults(searchResults.map(result => result.item));
    } else {
      setResults([]);
    }
  }, [query]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newQuery = formData.get("search") as string;
    setSearchParams({ q: newQuery });
  };
  
  const filteredResults = activeTab === "all" 
    ? results 
    : results.filter(result => result.category.toLowerCase() === activeTab);
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input 
            name="search"
            defaultValue={query}
            placeholder="Search utilities..."
            className="max-w-md"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Results ({results.length})</TabsTrigger>
          <TabsTrigger value="text tools">Text Tools</TabsTrigger>
          <TabsTrigger value="developer tools">Developer Tools</TabsTrigger>
          {/* More categories... */}
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredResults.length > 0 ? (
            <div className="grid gap-4">
              {filteredResults.map(result => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <p>No results found for "{query}"</p>
          )}
        </TabsContent>
        
        {/* More tab contents... */}
      </Tabs>
    </div>
  );
}

function SearchResultCard({ result }: { result: Utility }) {
  return (
    <a href={result.path} className="block">
      <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
        <h2 className="text-lg font-medium">{result.name}</h2>
        <p className="text-muted-foreground">{result.description}</p>
        <div className="flex gap-2 mt-2">
          {result.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-secondary rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
```

### Global Search Context
For more advanced applications, implement a global search context:

```tsx
import { createContext, useContext, useState, ReactNode } from "react";
import Fuse from "fuse.js";

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: Utility[];
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Utility[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(utilities, {
    keys: ["name", "description", "tags", "category"],
    threshold: 0.3,
    includeScore: true,
  });
  
  const performSearch = (searchQuery: string) => {
    if (searchQuery) {
      const searchResults = fuse.search(searchQuery);
      setResults(searchResults.map(result => result.item));
    } else {
      setResults([]);
    }
  };
  
  const addRecentSearch = (searchQuery: string) => {
    if (!searchQuery) return;
    
    setRecentSearches(prev => {
      const updated = [
        searchQuery,
        ...prev.filter(item => item !== searchQuery)
      ].slice(0, 5);
      
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };
  
  // Update search results when query changes
  useEffect(() => {
    performSearch(query);
  }, [query]);
  
  return (
    <SearchContext.Provider value={{
      query,
      setQuery,
      results,
      recentSearches,
      addRecentSearch,
      clearRecentSearches
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
```