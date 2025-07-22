import { useState, useEffect } from "react";
import { TextInput } from "./TextInput";
import { CaseFormatSelector } from "./CaseFormatSelector";
import { TextOutput } from "./TextOutput";
import { OptionsPanel } from "./OptionsPanel";
import { CaseFormat, ConversionOptionsState, DEFAULT_OPTIONS } from "./types";
import { convertCase } from "./case-converter";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

/**
 * Main component for the Text Case Converter tool
 */
export function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<CaseFormat>(CaseFormat.TITLE);
  const [options, setOptions] = useState<ConversionOptionsState>(DEFAULT_OPTIONS);

  // Update output text when input, format, or options change
  useEffect(() => {
    setOutputText(convertCase(inputText, selectedFormat, options));
  }, [inputText, selectedFormat, options]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <TextInput value={inputText} onChange={setInputText} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <TextOutput value={outputText} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <CaseFormatSelector value={selectedFormat} onChange={setSelectedFormat} />
            <Separator />
            <OptionsPanel options={options} onChange={setOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}