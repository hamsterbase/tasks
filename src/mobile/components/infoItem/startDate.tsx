import { formatDate } from '@/core/time/formatDate';
import React from 'react';

interface StartDateInfoItemProps {
  startDate?: number;
}

export const StartDateInfoItem: React.FC<StartDateInfoItemProps> = ({ startDate }) => {
  return <span>{`${formatDate(startDate)}`}</span>;
};
