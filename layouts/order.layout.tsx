import StepIndicator from "@/components/pages/order/indicator";
import { ISteps } from "@/interfaces/order.interface";
import { steps } from "@/lib/constants";
import { useState } from "react";

const OrderLayout = () => {
  const [currentStep, setCurrentStep] = useState<string>(steps[0].id);

  const renderStep = () => {
    switch (currentStep) {
      case ISteps.SENDER:
        return <></>;
      case ISteps.RECEIVER:
        return <></>;
      case ISteps.ITEMS:
        return <></>;
      case ISteps.SUMMARY:
        return <></>;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <StepIndicator
        currentStep={currentStep!}
        setCurrentStep={setCurrentStep}
      />
      <div className="flex-1 p-8 pt-6">
        <div className="max-w-4xl mx-auto">{renderStep()}</div>
      </div>
    </div>
  );
};

export default OrderLayout;
