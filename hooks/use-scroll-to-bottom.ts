
import { useRef, useEffect, useCallback } from "react";

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      endRef.current?.scrollIntoView({ behavior });
    },
    []
  );

    return {
        containerRef, endRef,
        scrollToBottom
    };
}
