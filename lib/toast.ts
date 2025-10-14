import { JSX } from "react";
import { ToastType, toast, ToastOptions } from "react-hot-toast";

const notify = (
  message: string | JSX.Element | null,
  type: ToastType = "blank",
  options: ToastOptions = {}
) => {
  switch (type) {
    case "success":
      return toast.success(message, options);
    case "custom":
      return toast.custom(message, options);
    case "error":
      return toast.error(message, options);
    case "loading":
      return toast.loading(message, options);
    case "blank":
      return toast(message, options);
    default:
      return toast.success(message, options);
  }
};

const notifyPromise = toast.promise;

const notifyDismiss = toast.dismiss;

export { notify, notifyPromise, notifyDismiss };
