import { useState } from 'react';

export const useRender = () => {
  const counter = useState(0)[1];
  return () => counter((e) => e + 1);
};
