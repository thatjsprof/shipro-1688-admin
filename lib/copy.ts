import { CSSProperties, useState } from "react";
import copy from "copy-to-clipboard";
import { notify } from "./toast";
import { ToastPosition } from "react-hot-toast";

export interface ICopy {
  id: string;
  text: string;
  message: string;
  style?: CSSProperties;
  position?: ToastPosition;
}

const useCopy = () => {
  const [value, setValue] = useState<string | number>("");

  const copyToClipboard = ({
    id,
    text,
    message,
    style,
    position = "top-center",
  }: ICopy) => {
    const result = copy(text);
    if (result) setValue(text);
    notify(message || "Text Copied To Clipboard", "success", {
      id,
      position,
      style,
    });
  };

  return {
    copyToClipboard,
    value,
  };
};

export default useCopy;
