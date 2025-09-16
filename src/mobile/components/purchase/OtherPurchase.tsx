import { useService } from '@/hooks/use-service';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { localize } from '@/nls';
import { ISwitchService } from '@/services/switchService/common/switchService';
import React from 'react';

export const OtherPurchase = () => {
  const switchService = useService(ISwitchService);
  if (!switchService.getLocalSwitch('showNormalPurchaseButton')) {
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
            window.open(localize('account.pro.link', 'https://hamsterbase.com/store/?product=cloud'));
          },
        },
        {
          title: localize('account.lifetime.title', 'Purchase HamsterBase Cloud Lifetime'),
          mode: {
            type: 'button',
            theme: 'primary',
            align: 'center',
          },
          onClick: async () => {
            window.open(localize('account.lifetime.link', 'https://hamsterbase.com/store/?product=cloud-lifetime'));
          },
        },
      ]}
    />
  );
};
