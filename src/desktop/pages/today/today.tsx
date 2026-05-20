import { useConfig } from '@/hooks/useConfig';
import { groupTodayByAreaProjectConfigKey } from '@/services/config/config';
import React from 'react';
import { GroupToday } from './GroupToday';
import { Today as NotGroupToday } from './index';

export const Today = () => {
  const { value: groupByAreaProject } = useConfig(groupTodayByAreaProjectConfigKey());
  if (!groupByAreaProject) {
    return <NotGroupToday />;
  }
  return <GroupToday />;
};
