import { steps } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface IStepIndicator {
  currentStep: string;
  setCurrentStep: (val: string) => void;
}

const StepIndicator = ({ currentStep, setCurrentStep }: IStepIndicator) => {
  return (
    <div className="bg-white border-gray-200 p-6 pl-0 min-h-screen w-[14rem]">
      <div className="space-y-2">
        {steps.map((step) => {
          const isCurrent = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 cursor-pointer text-[1rem]",
                isCurrent && "text-white bg-primary"
              )}
            >
              {/* {isCurrent && <Check className="h-4 w-4 text-green-400" />} */}
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
