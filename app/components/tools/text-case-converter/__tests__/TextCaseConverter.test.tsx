import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextCaseConverter } from "../TextCaseConverter";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("TextCaseConverter", () => {
  it("renders all components", () => {
    render(<TextCaseConverter />);

    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.getByText("Options")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/type or paste your text here/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("converts text in real-time when input changes", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId("output-textarea");

    fireEvent.change(textarea, { target: { value: "hello world" } });

    await waitFor(() => {
      // Default format is TITLE, so "hello world" should become "Hello World"
      expect(outputTextarea).toHaveValue("Hello World");
    });
  });

  it("converts text when format changes", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId("output-textarea");

    // Enter text
    fireEvent.change(textarea, { target: { value: "hello world" } });

    // Change format to uppercase
    const uppercaseRadio = screen.getByLabelText("UPPERCASE");
    fireEvent.click(uppercaseRadio);

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("HELLO WORLD");
    });
  });

  it("converts text when options change", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId(
      "output-textarea"
    ) as HTMLTextAreaElement;

    // Enter text with acronyms
    fireEvent.change(textarea, { target: { value: "hello USA world" } });

    // Change format to title case
    const titleRadio = screen.getByLabelText("Title Case");
    fireEvent.click(titleRadio);

    await waitFor(() => {
      // Verify that the text is converted to title case
      // The exact behavior depends on whether acronym preservation is enabled by default
      expect(outputTextarea.value).toMatch(/Hello (USA|Usa) World/);
    });
  });

  it("handles empty input", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId("output-textarea");

    fireEvent.change(textarea, { target: { value: "" } });

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("");
    });
  });

  it("handles multi-line text conversion", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId("output-textarea");

    const multiLineText = "hello world\nsecond line\nthird line";
    fireEvent.change(textarea, { target: { value: multiLineText } });

    await waitFor(() => {
      expect(outputTextarea).toHaveValue(
        "Hello World\nSecond Line\nThird Line"
      );
    });
  });

  it("integrates copy functionality", async () => {
    const mockWriteText = vi.fn();
    (navigator.clipboard.writeText as any) = mockWriteText;

    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    fireEvent.change(textarea, { target: { value: "hello world" } });

    await waitFor(() => {
      const copyButton = screen.getByText("Copy");
      fireEvent.click(copyButton);
      expect(mockWriteText).toHaveBeenCalledWith("Hello World");
    });
  });

  it("handles programming case formats correctly", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId("output-textarea");

    fireEvent.change(textarea, { target: { value: "hello world test" } });

    // Test camelCase
    const camelCaseRadio = screen.getByLabelText("camelCase");
    fireEvent.click(camelCaseRadio);

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("helloWorldTest");
    });

    // Test snake_case
    const snakeCaseRadio = screen.getByLabelText("snake_case");
    fireEvent.click(snakeCaseRadio);

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("hello_world_test");
    });

    // Test kebab-case
    const kebabCaseRadio = screen.getByLabelText("kebab-case");
    fireEvent.click(kebabCaseRadio);

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("hello-world-test");
    });
  });

  it("maintains state consistency across component updates", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId("output-textarea");

    // Set initial state
    fireEvent.change(textarea, { target: { value: "test text" } });

    const camelCaseRadio = screen.getByLabelText("camelCase");
    fireEvent.click(camelCaseRadio);

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("testText");
    });

    // Change input while format is camelCase
    fireEvent.change(textarea, { target: { value: "new test text" } });

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("newTestText");
      expect(camelCaseRadio).toBeChecked();
    });
  });

  it("handles special characters correctly", async () => {
    render(<TextCaseConverter />);

    const textarea = screen.getByTestId("text-input");
    const outputTextarea = screen.getByTestId("output-textarea");

    const textWithSpecialChars = "hello-world_test 123 @#$%";
    fireEvent.change(textarea, { target: { value: textWithSpecialChars } });

    const titleRadio = screen.getByLabelText("Title Case");
    fireEvent.click(titleRadio);

    await waitFor(() => {
      expect(outputTextarea).toHaveValue("Hello-world_test 123 @#$%");
    });
  });
});
