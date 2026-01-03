import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "./scroll-area";

const FadeScrollArea = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const update = () => {
    const el = viewportRef.current;
    if (!el) return;
    setShowTop(el.scrollTop > 0);
    setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    viewportRef.current = containerRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    update();
    viewportRef.current?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      viewportRef.current?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {showTop && (
        <>
          <div className="absolute top-0 left-0 right-0 h-12 z-20 pointer-events-none bg-gradient-to-b from-gray-100/60 to-transparent" />
          <ChevronUp className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 opacity-40 z-30 pointer-events-none" />
        </>
      )}
      {showBottom && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-12 z-20 pointer-events-none bg-gradient-to-t from-gray-100/60 to-transparent" />
          <ChevronDown className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 opacity-50 z-30 pointer-events-none" />
        </>
      )}
      <ScrollArea className="max-h-[30rem] w-full">{children}</ScrollArea>
    </div>
  );
};

export default FadeScrollArea;
