import * as React from "react";
import { cn } from "@/lib/utils";

const StepsContext = React.createContext<{
  value: number;
  onChange: (value: number) => void;
}>({
  value: 0,
  onChange: () => {},
});

const Steps = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    onValueChange?: (value: number) => void;
  }
>(({ className, value = 0, onValueChange, ...props }, ref) => {
  const [activeStep, setActiveStep] = React.useState(value);

  React.useEffect(() => {
    setActiveStep(value);
  }, [value]);

  const handleChange = React.useCallback(
    (index: number) => {
      setActiveStep(index);
      onValueChange?.(index);
    },
    [onValueChange]
  );

  return (
    <StepsContext.Provider value={{ value: activeStep, onChange: handleChange }}>
      <div
        ref={ref}
        className={cn("flex flex-row items-center", className)}
        {...props}
      />
    </StepsContext.Provider>
  );
});
Steps.displayName = "Steps";

const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
    index?: number;
  }
>(({ className, label, index, ...props }, ref) => {
  const { value } = React.useContext(StepsContext);
  const stepIndex = index ?? 0;
  const isActive = value === stepIndex;
  const isCompleted = value > stepIndex;

  return (
    <div
      ref={ref}
      className={cn("flex-1 flex flex-col items-center", className)}
      {...props}
    >
      <div className="flex flex-col items-center w-full">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            isActive
              ? "bg-primary text-white"
              : isCompleted
              ? "bg-primary text-white"
              : "bg-gray-300 text-gray-600"
          )}
        >
          {isCompleted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            stepIndex + 1
          )}
        </div>
        {label && (
          <p className="mt-1 text-xs text-center">
            {label}
          </p>
        )}
      </div>
      {stepIndex < 3 && (
        <div className="h-1 flex-1 bg-gray-300 w-full mt-4">
          <div className={cn("h-full", isCompleted ? "bg-primary" : "")} />
        </div>
      )}
    </div>
  );
});
Step.displayName = "Step";

export { Steps, Step };
