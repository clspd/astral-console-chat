import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

type Props = {
  onSubmit: (value: string) => void;
};

export default function InputBox({ onSubmit }: Props) {
  const [input, setInput] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  const handleInput = useCallback(
    (char: string, key: any) => {
      // 回车提交
      if (key.return) {
        const trimmed = input.trim();
        if (trimmed) {
          onSubmit(trimmed);
          setInput('');
          setCursorPos(0);
        }
        return;
      }

      // Backspace / Delete
      if (key.backspace && cursorPos > 0) {
        setInput(prev => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
        setCursorPos(c => c - 1);
        return;
      }
      if (key.delete && cursorPos < input.length) {
        setInput(prev => prev.slice(0, cursorPos) + prev.slice(cursorPos + 1));
        return;
      }

      // 光标移动
      if (key.leftArrow)  { setCursorPos(c => Math.max(0, c - 1)); return; }
      if (key.rightArrow) { setCursorPos(c => Math.min(input.length, c + 1)); return; }
      if (key.home)       { setCursorPos(0); return; }
      if (key.end)        { setCursorPos(input.length); return; }

      // 普通字符（包括中文）— 宽松条件：只要不是控制键就接受
      if (char && !key.ctrl && !key.meta && !key.tab && !key.escape) {
        setInput(prev => prev.slice(0, cursorPos) + char + prev.slice(cursorPos));
        setCursorPos(c => c + char.length);
      }
    },
    [input, cursorPos, onSubmit],
  );

  useInput(handleInput);

  const beforeCursor = input.slice(0, cursorPos);
  const atCursor = input[cursorPos] ?? ' ';
  const afterCursor = input.slice(cursorPos + 1);

  return (
    <Box width="100%" borderStyle="round" paddingX={1}>
      <Text color="cyan" bold>
        ›{' '}
      </Text>
      <Text>{beforeCursor}</Text>
      <Text inverse>{atCursor}</Text>
      <Text>{afterCursor}</Text>
    </Box>
  );
}
