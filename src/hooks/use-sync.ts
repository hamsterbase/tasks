import { useState } from 'react';
import { flushSync } from 'react-dom';

export const useSync = () => {
  const counter = useState(0)[1];
  return () => {
    flushSync(() => {
      counter((e) => e + 1);
    });
  };
};
