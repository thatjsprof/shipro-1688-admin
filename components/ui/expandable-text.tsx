import { useState, useEffect, useRef } from "react";

interface ExpandableTextProps {
  text: string;
  className?: string;
  maxLines?: number;
  onClick?: () => void;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  className = "text-base leading-relaxed text-gray-800",
  maxLines = 2,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [truncatedText, setTruncatedText] = useState<string>(text);
  const [needsTruncation, setNeedsTruncation] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const truncateText = (): void => {
      if (!containerRef.current) return;

      const temp = document.createElement("div");
      temp.className = className;
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      temp.style.width = `${containerRef.current.offsetWidth}px`;
      temp.style.top = "-9999px";
      document.body.appendChild(temp);

      temp.textContent = text;
      const style = getComputedStyle(temp);
      const lineHeight = parseFloat(style.lineHeight);
      const paddingTop = parseFloat(style.paddingTop);
      const paddingBottom = parseFloat(style.paddingBottom);

      const contentHeight = lineHeight * maxLines;
      const maxHeight = contentHeight + paddingTop + paddingBottom;

      if (temp.scrollHeight <= maxHeight + 1) {
        setNeedsTruncation(false);
        setTruncatedText(text);
        document.body.removeChild(temp);
        return;
      }

      setNeedsTruncation(true);

      let left = 0;
      let right = text.length;
      let maxFit = 0;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        temp.textContent = text.slice(0, mid);

        if (temp.scrollHeight <= maxHeight + 1) {
          maxFit = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      const ellipsis = " ... ";
      const moreBtn = "more";

      let finalFit = maxFit;

      for (let i = maxFit; i > 0; i--) {
        const testText = text.slice(0, i);
        temp.innerHTML =
          testText +
          '<span style="white-space: nowrap;"> ' +
          ellipsis +
          moreBtn +
          "</span>";

        if (temp.scrollHeight <= maxHeight + 1) {
          finalFit = i;
          break;
        }
      }

      setTruncatedText(text.slice(0, finalFit));
      document.body.removeChild(temp);
    };

    const timer = setTimeout(() => {
      truncateText();
    }, 100);

    const handleResize = (): void => {
      truncateText();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [text, maxLines, className]);

  return (
    <div ref={containerRef} className="relative">
      <p className={`${className} transition-all duration-300`}>
        {isExpanded ? (
          <>
            <span onClick={onClick}>{text} </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-blue-600 font-medium cursor-pointer"
            >
              less
            </button>
          </>
        ) : (
          <>
            <span onClick={onClick}>{truncatedText}</span>
            {needsTruncation && (
              <>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-blue-600 font-medium cursor-pointer"
                >
                  <span> ... </span>
                  more
                </button>
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
};

export default ExpandableText;
