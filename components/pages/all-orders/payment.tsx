import { CreatePaymentFormFields } from "@/components/pages/payment/create-payment-form-fields";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/interfaces/payment.interface";
import { createOrderSchema } from "@/schemas/new-order.schema";
import { Plus, X } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import z from "zod";

interface IPaymentProps {
  form: UseFormReturn<z.infer<typeof createOrderSchema>>;
}

const DESCRIPTION_PRESETS = [
  { label: "Shipping Fee", value: "Shipping Fee" },
  { label: "Goods Fee", value: "Goods Fee" },
];

const Payment = ({ form }: IPaymentProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  return (
    <div>
      {fields.map((field, idx) => (
        <div className="my-4 border rounded-lg p-6 pt-5 relative" key={field.id}>
          <p className="mb-5 font-semibold">
            {form.watch(`payments.${idx}.description`) || `Payment ${idx + 1}`}
          </p>
          <CreatePaymentFormFields
            form={form}
            namePrefix={`payments.${idx}`}
            descriptionPresets={DESCRIPTION_PRESETS}
            showDatePaid={false}
          />
          {fields.length > 1 && (
            <div
              className="absolute right-3 top-3 bg-destructive rounded-full flex items-center justify-center text-white h-6 w-6 cursor-pointer"
              onClick={() => remove(idx)}
            >
              <X className="size-4" />
            </div>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="h-11 shadow-none w-full mt-2"
        onClick={() => {
          append({
            amount: "",
            status: PaymentStatus.PENDING,
            provider: "",
            description: "",
            redirectLink: "",
            code: "",
            sendEmail: false,
            paymentBreakdown: [],
          });
        }}
      >
        <Plus />
        Add Payment
      </Button>
    </div>
  );
};

export default Payment;
