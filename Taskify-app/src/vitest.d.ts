import "@testing-library/jest-dom";
import type { Assertion, AsymmetricMatchersContaining } from "vitest";

interface CustomMatchers<R = any> {
  toBeInTheDocument(): R;
  toBeVisible(): R;
  toBeEnabled(): R;
  toBeDisabled(): R;
  toBeEmpty(): R;
  toBeEmptyDOMElement(): R;
  toBeInvalid(): R;
  toBeRequired(): R;
  toBeValid(): R;
  toContainElement(element?: HTMLElement | null): R;
  toContainHTML(html: string): R;
  toHaveAttribute(attr: string, value?: string | RegExp): R;
  toHaveClass(className: string | string[]): R;
  toHaveFocus(): R;
  toHaveFormValues(values: Record<string, any>): R;
  toHaveStyle(style: string | Record<string, any>): R;
  toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
  toHaveValue(value?: string | string[] | number): R;
  toBeChecked(): R;
  toBePartiallyChecked(): R;
  toHaveErrorMessage(message: string): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
