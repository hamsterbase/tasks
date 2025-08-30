import { TEST_ACCOUNT_LIST } from '@/base/common/account';
import { useService } from '@/hooks/use-service';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { localize } from '@/nls';
import { ISwitchService } from '@/services/switchService/common/switchService';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { differenceInCalendarDays } from 'date-fns';
import React, { useState } from 'react';
import useSWR from 'swr';

interface UserInfo {
  account: string;
  expiresAt: number;
  accountId: string;
}

export const AppleStorePurchase: React.FC<{
  userInfo?: UserInfo | null;
  onPurchase?: () => void;
}> = ({ userInfo, onPurchase }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const switchService = useService(ISwitchService);
  const { data: productInfo } = useSWR(
    switchService.getLocalSwitch('showIOSPurchaseButton') && userInfo ? 'AppleStorePurchase.productInfo' : null,
    async () => {
      if (!userInfo) {
        return null;
      }
      const diff = differenceInCalendarDays(new Date(userInfo.expiresAt), new Date());
      // 会员过期时间大于45天，则不显示购买按钮
      if (diff > 45 && !TEST_ACCOUNT_LIST.includes(userInfo.account)) {
        return null;
      }
      Purchases.configure({
        apiKey: 'appl_FWikbgMUBqiafUyuIiCjpOirXSH',
        appUserID: userInfo.accountId,
      });
      return true;
    },
    {
      revalidateOnFocus: true,
    }
  );
  return (
    <ListItemGroup
      className="mt-8"
      items={[
        {
          hidden: !!userInfo,
          title: localize('account.apple_store_purchase.fetching', 'Loading Purchase Info...'),
          mode: {
            type: 'button',
            theme: 'primary',
            align: 'center',
          },
        },
        {
          hidden: !productInfo,
          title: isLoading
            ? localize('account.apple_store_purchase.purchasing', 'Purchasing...')
            : localize('account.apple_store_purchase.title', 'Subscribe 1 Year Cloud Pro'),
          mode: {
            type: 'button',
            theme: 'primary',
            align: 'center',
          },
          onClick: async () => {
            setIsLoading(true);
            try {
              const product = await Purchases.getProducts({
                productIdentifiers: ['HamsterbaseCloudProOneYear'],
              });
              if (product.products.length === 0) {
                toast({
                  message: localize('account.apple_store_purchase_fetch.error', 'Failed to get product'),
                });
                return;
              }
              await Purchases.purchaseStoreProduct({
                product: product.products[0],
              });
              if (onPurchase) {
                onPurchase();
              }
              toast({
                message: localize('account.apple_store_purchase.success', 'Purchase successful'),
              });
            } catch (error) {
              toast({
                message: (error as Error).message,
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]}
    />
  );
};
