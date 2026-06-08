import { SettingsIcon } from '@/components/icons';
import { getCalendarWeekStartOptions, type CalendarWeekStartDay } from '@/core/time/calendarWeekStart';
import { useConfig } from '@/hooks/useConfig';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout';
import { localize } from '@/nls';
import { calendarWeekStartDayConfigKey } from '@/services/config/config';
import React from 'react';

export const CalendarSettings = () => {
  const { value: weekStartDay, setValue: setWeekStartDay } = useConfig(calendarWeekStartDayConfigKey());

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'calendarSettings',
        title: localize('settings.calendar', 'Calendar'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup
        title={localize('settings.calendar_week_start_day', 'Week starts on')}
        subtitle={localize(
          'settings.calendar_week_start_day.description',
          'Choose the first day of the week in date pickers.'
        )}
        items={getCalendarWeekStartOptions().map((option) => ({
          title: option.label,
          mode: {
            type: 'check',
            checked: weekStartDay === option.value,
          },
          onClick: () => setWeekStartDay(option.value as CalendarWeekStartDay),
        }))}
      />
    </PageLayout>
  );
};
