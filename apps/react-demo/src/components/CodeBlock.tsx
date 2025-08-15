import { FC } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  children: string;
}

export const CodeBlock: FC<Props> = ({ children }) => (
  <div className="overflow-auto w-full max-w-5xl">
    <SyntaxHighlighter
      language="tsx"
      style={oneDark}
      customStyle={{ margin: 0 }}
    >
      {children}
    </SyntaxHighlighter>
  </div>
);
