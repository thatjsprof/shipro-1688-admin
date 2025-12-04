import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import ReactDOM from "react-dom";
import { Button } from "./button";
import { Icons } from "../shared/icons";
import { cn } from "@/lib/utils";

interface IActionAlert {
  title: string;
  body: string | React.ReactNode;
  footer?: string | React.ReactNode;
  loading?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  actionText?: string;
  handleAction?: () => void;
  className?: string;
  descCls?: string;
  closeCls?: string;
}

const ActionAlert = ({
  open,
  setOpen,
  footer,
  title,
  body,
  descCls,
  closeCls,
  loading,
  children,
  className,
  actionText,
  handleAction,
}: PropsWithChildren<IActionAlert>) => {
  return (
    <div>
      {open &&
        ReactDOM.createPortal(
          <Dialog modal={true} open={open} onOpenChange={setOpen}>
            {open && <div className="fixed inset-0 bg-black/30 z-[100]" />}
            <DialogContent
              showCloseButton={false}
              className={cn("bg-white z-[101]", className)}
            >
              <DialogHeader className={!children ? "gap-2" : ""}>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className={descCls}>
                  {body}
                </DialogDescription>
              </DialogHeader>
              {children && <div className="grid gap-4 py-4"></div>}
              <DialogFooter className={!children ? "mt-4" : ""}>
                {footer || (
                  <div className="flex gap-2">
                    <Button
                      className={cn(
                        "shadow-none text-sm h-10 outline-none",
                        closeCls
                      )}
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      disabled={loading}
                      onClick={handleAction}
                      className="shadow-none bg-destructive hover:bg-destructive text-sm h-10"
                    >
                      {loading && (
                        <Icons.spinner className="h-3 w-3 animate-spin" />
                      )}
                      {actionText}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>,
          document.body
        )}
    </div>
  );
};

export default ActionAlert;
