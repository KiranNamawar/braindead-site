import { TextCaseConverter } from "~/components/tools/text-case-converter/TextCaseConverter";

/**
 * Page component for the Text Case Converter tool
 */
export default function TextCaseConverterPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Text Case Converter</h1>
      <p className="text-muted-foreground mb-6">
        Convert text between different case formats
      </p>
      
      <TextCaseConverter />
    </div>
  );
}

/**
 * Meta tags for the Text Case Converter page
 */
export const meta = () => {
  return [
    { title: "Text Case Converter | braindead.site" },
    { name: "description", content: "Convert text between different case formats including uppercase, lowercase, title case, camelCase, snake_case, and more." },
  ];
};