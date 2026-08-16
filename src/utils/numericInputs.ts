let numericInputCleanup: (() => void) | null = null;

const ZERO_VALUES = new Set(["0", "-0"]);

export const normalizeLeadingZeroNumberValue = (value: string): string => {
  if (!value || ZERO_VALUES.has(value)) {
    return value;
  }

  return value.replace(/^(-?)0+(?=\d)/, "$1");
};

const getNumberInput = (target: EventTarget | null): HTMLInputElement | null => {
  if (!(target instanceof HTMLInputElement)) {
    return null;
  }

  return target.type === "number" ? target : null;
};

export const installNumericInputZeroNormalizer = (root: Document = document): (() => void) => {
  if (numericInputCleanup) {
    return numericInputCleanup;
  }

  const selectInitialZero = (event: FocusEvent): void => {
    const input = getNumberInput(event.target);
    if (!input || input.disabled || input.readOnly || !ZERO_VALUES.has(input.value)) {
      return;
    }

    requestAnimationFrame(() => {
      if (root.activeElement === input && ZERO_VALUES.has(input.value)) {
        input.select();
      }
    });
  };

  const normalizeInputValue = (event: Event): void => {
    const input = getNumberInput(event.target);
    if (!input) {
      return;
    }

    const normalizedValue = normalizeLeadingZeroNumberValue(input.value);
    if (normalizedValue !== input.value) {
      input.value = normalizedValue;
    }
  };

  root.addEventListener("focusin", selectInitialZero, true);
  root.addEventListener("input", normalizeInputValue, true);

  numericInputCleanup = () => {
    root.removeEventListener("focusin", selectInitialZero, true);
    root.removeEventListener("input", normalizeInputValue, true);
    numericInputCleanup = null;
  };

  return numericInputCleanup;
};
