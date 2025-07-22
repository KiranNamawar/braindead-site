import { useState, useEffect, useRef } from "react";
import { TextInput } from "./TextInput";
import { CaseFormatSelector } from "./CaseFormatSelector";
import { TextOutput } from "./TextOutput";
import { OptionsPanel } from "./OptionsPanel";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { CaseFormat, type ConversionOptionsState, DEFAULT_OPTIONS, CASE_FORMATS } from "./types";
import { convertCase } from "./case-converter";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { ResizableText } from "~/components/ui/resizable-text";

/**
 * Main component for the Text Case Converter tool
 */
export function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<CaseFormat>(CaseFormat.TITLE);
  const [options, setOptions] = useState<ConversionOptionsState>(DEFAULT_OPTIONS);
  const [prevFormat, setPrevFormat] = useState<CaseFormat>(selectedFormat);
  const initialRenderRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  // Update output text when input, format, or options change
  useEffect(() => {
    setOutputText(convertCase(inputText, selectedFormat, options));
    
    // Track format changes for announcements
    if (!initialRenderRef.current && prevFormat !== selectedFormat) {
      setPrevFormat(selectedFormat);
    }
    
    // After first render, set initialRender to false
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
    }
  }, [inputText, selectedFormat, options]);

  // Get the current format name for announcements
  const getCurrentFormatName = () => {
    const format = CASE_FORMATS.find(f => f.id === selectedFormat);
    return format ? format.label : selectedFormat;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 text-container" role="application" aria-label="Text Case Converter">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="input-section-title" className="text-base sm:text-lg md:text-xl">Input</CardTitle>
        </CardHeader>
        <CardContent aria-labelledby="input-section-title">
          <TextInput value={inputText} onChange={setInputText} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="output-section-title" className="text-base sm:text-lg md:text-xl">Output</CardTitle>
          <KeyboardShortcutsHelp />
        </CardHeader>
        <CardContent aria-labelledby="output-section-title">
          <TextOutput value={outputText} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="options-section-title" className="text-base sm:text-lg md:text-xl">Options</CardTitle>
        </CardHeader>
        <CardContent aria-labelledby="options-section-title">
          <div className="space-y-6">
            <CaseFormatSelector value={selectedFormat} onChange={setSelectedFormat} />
            <Separator role="separator" />
            <OptionsPanel options={options} onChange={setOptions} />
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden element for screen readers to announce keyboard shortcuts on load */}
      <div className="sr-only" aria-live="polite" role="status">
        Keyboard shortcuts available. Press Alt+1 to focus input, Alt+2 to focus output, 
        Alt+C to copy, Alt+D to download, Alt+O to toggle options, and Alt+Delete to clear input.
      </div>
      
      {/* Format change announcements for screen readers */}
      {!initialRenderRef.current && prevFormat !== selectedFormat && (
        <div className="sr-only" aria-live="polite" role="status">
          Case format changed to {getCurrentFormatName()}
        </div>
      )}
    </div>
  );
}