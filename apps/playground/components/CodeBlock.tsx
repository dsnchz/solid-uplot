import "solid-prism-editor/layout.css";
import "solid-prism-editor/themes/github-dark.css";

import { type Component } from "solid-js";
import { Editor } from "solid-prism-editor";

type CodeBlockProps = {
  code: string;
  language: string;
};

export const CodeBlock: Component<CodeBlockProps> = (props) => {
  return (
    <div class="rounded-lg border border-gray-200 bg-gray-900">
      <Editor value={props.code} language={props.language} readOnly class="!m-0 !rounded-lg !p-4" />
    </div>
  );
};
