import { useCallback, useState } from 'react';

export const SessionStorageKeys = {
  loginMode: 'loginMode',
};

export const useSessionStorageState = <T>(key: keyof typeof SessionStorageKeys, defaultValue: T) => {
  const [value, _setValue] = useState<T>(
    sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key) as string) : defaultValue
  );

  const setValue = useCallback(
    (v: T) => {
      sessionStorage.setItem(key, JSON.stringify(v));
      _setValue(v);
    },
    [_setValue, key]
  );

  return [value, setValue] as const;
};
