import { type FC, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Props {
  children: ReactNode;
  component: ReactNode;
}

export const CodeToggle: FC<Props> = ({ component, children }) => {
  return (
    <Tabs defaultValue="preview" className="max-w-5xl w-full">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent
        value="preview"
        className="card flex justify-center items-center min-h-[300px]"
      >
        {component}
      </TabsContent>
      <TabsContent value="code">{children}</TabsContent>
    </Tabs>
  );
};
