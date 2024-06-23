import { useState } from "react";

function useStepper(options = {} as StepperHookOptions) {
  const minStep = options.minStep || 0;
  const maxStep = options.maxStep;
  const initialStep =
    options?.initialStep >= minStep ? options?.initialStep : minStep;

  const [step, setStep] = useState(initialStep);

  function canPreviousStep() {
    return step > minStep;
  }

  const canNextStep = () => {
    return step < maxStep;
  };

  const previousStep = () => {
    setStep((previousStep) => previousStep - 1);
  };

  const nextStep = () => {
    setStep((previousStep) => previousStep + 1);
  };

  return {
    step,
    setStep,
    previousStep,
    nextStep,
    canPreviousStep,
    canNextStep,
  };
}

export default useStepper;

export interface StepperHookOptions {
  minStep: number;
  maxStep: number;
  initialStep: number;
}
