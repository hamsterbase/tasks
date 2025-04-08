import { isOther } from '@/base/browser/channel';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { localize } from '@/nls';
import React from 'react';

export const OtherPurchase = () => {
  if (!isOther()) {
    return null;
  }
  return (
    <ListItemGroup
      className="mt-8"
      items={[
        {
          title: localize('account.pro.title', 'Subscribe 1 Year Cloud Pro'),
          mode: {
            type: 'button',
            theme: 'primary',
            align: 'center',
          },
          onClick: async () => {
            window.open('https://hamsterbase.com/store/?product=cloud');
          },
        },
      ]}
    />
  );
};
