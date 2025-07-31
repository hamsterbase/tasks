import { ConfigKey, IConfigService } from '@/services/config/configService.ts';
import { useService } from './use-service';
import { useWatchEvent } from './use-watch-event';

export function useConfig<T>(key: ConfigKey<T>): {
  value: T;
  setValue: (value: T) => void;
  saveIfValid: (value: T) => void;
} {
  const config = useService(IConfigService);
  useWatchEvent(config.onConfigChange, (event) => {
    return event.key === key.key;
  });

  return {
    value: config.get<T>(key),
    setValue: (value: T) => {
      config.save(key, value);
    },
    saveIfValid: (value: T) => {
      if (key.check(value)) {
        config.save(key, value);
      }
    },
  };
}
