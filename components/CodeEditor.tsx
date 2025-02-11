// 'use client'
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  defaultLanguage?: string;
  defaultValue?: string;
  update: (value: string | undefined) => void;
}

export function CodeEditor({
  defaultLanguage = 'javascript',
  defaultValue = '// Start coding here...',
  update
}: CodeEditorProps) {

  return (
    <div className="w-[90%] h-[90%] rounded-b-lg overflow-hidden flex flex-col justify-center shadow-lg relative">
      {/* <div className="w-[90%] h-[90%] border-0"> */}
        <Editor
          defaultLanguage={defaultLanguage}
          defaultValue={defaultValue}
          theme="vs-dark"
          className='rounded-none'
          onChange={(value) => {
            update(value);
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            tabSize: 2,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderValidationDecorations: 'on',
            renderWhitespace: 'none',
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
        />
      {/* </div> */}
    </div>
  );
}