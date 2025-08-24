import Link from "next/link";
import React, { memo } from "react";
import { Streamdown, type StreamdownProps } from "streamdown";

type Components = StreamdownProps["components"];

const components: Partial<Components> = {
  a: ({
    href = "",
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return (
      <Link
        href={href}
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...rest}
      >
        {children}
      </Link>
    );
  },
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => (
  <Streamdown components={components}>{children}</Streamdown>
);

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
