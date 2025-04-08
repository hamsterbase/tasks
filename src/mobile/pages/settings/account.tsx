import { SettingsIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout';
import { AppleStorePurchase } from '@/mobile/components/purchase/AppleStorePurchase';
import { OtherPurchase } from '@/mobile/components/purchase/OtherPurchase';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Navigate } from 'react-router';
import useSWR from 'swr';

export const AccountPage = () => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);
  const [isLoading, setIsLoading] = useState(false);
  const dialog = useDialog();
  const toast = useToast();
  const { data: userInfo, mutate: mutateUserInfo } = useSWR(
    cloudService.config.type === 'login' ? 'cloudService.userInfo' : null,
    async () => await cloudService.userInfo(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const handleCopyAccountId = () => {
    if (userInfo?.accountId) {
      navigator.clipboard.writeText(userInfo.accountId);
      toast({
        message: localize('account.copy.success', 'Account ID copied to clipboard'),
      });
    }
  };

  const handleLogout = () => {
    dialog({
      title: localize('account.logout.title', 'Logout'),
      description: localize('account.logout.confirm', 'Are you sure you want to logout?'),
      confirmText: localize('account.logout.button', 'Logout'),
      cancelText: localize('common.cancel', 'Cancel'),
      onConfirm: async () => {
        try {
          // Set config to not_login and clear local storage
          localStorage.removeItem('account');
          location.reload(); // Reload to ensure clean logout state
        } catch (error) {
          console.error('Logout failed:', error);
          dialog({
            title: localize('account.error.title', 'Error'),
            description: localize('account.error.logoutFailed', 'Failed to logout. Please try again.'),
            confirmText: localize('common.ok', 'OK'),
          });
        }
      },
    });
  };

  const handleDeleteAccount = () => {
    dialog({
      title: localize('account.delete.title', 'Delete Account'),
      description: localize(
        'account.delete.confirm',
        'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
      ),
      confirmText: localize('account.delete.button', 'Delete Account'),
      cancelText: localize('common.cancel', 'Cancel'),
      onConfirm: async () => {
        try {
          // Check if logged in before attempting to delete
          if (cloudService.config.type === 'not_login') {
            throw new Error('Not logged in');
          }
          cloudService.deleteAccount();
        } catch (error) {
          console.error('Delete account failed:', error);
          dialog({
            title: localize('account.error.title', 'Error'),
            description: localize('account.error.deleteFailed', 'Failed to delete account. Please try again.'),
            confirmText: localize('common.ok', 'OK'),
          });
        }
      },
    });
  };

  if (cloudService.config.type === 'not_login') {
    return (
      <PageLayout
        header={{
          id: 'account',
          title: localize('account.title', 'Account'),
          renderIcon: (className: string) => <SettingsIcon className={className} />,
        }}
      >
        <Navigate to={'/settings/cloud'} replace></Navigate>
      </PageLayout>
    );
  }

  const formatExpiryDate = (timestamp: number) => {
    const localDate = new Date(timestamp);
    return format(localDate, 'yyyy-MM-dd HH:mm:ss');
  };

  return (
    <PageLayout
      header={{
        id: 'account',
        title: localize('account.title', 'Account'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      <ListItemGroup
        items={[
          {
            title: localize('account.email', 'Email'),
            mode: {
              type: 'label',
              label: cloudService.config.account,
            },
          },
          {
            title: localize('account.id', 'ID'),
            mode: {
              type: 'label',
              label: userInfo?.accountId || '-',
            },
            onClick: handleCopyAccountId,
          },
          {
            title: localize('account.expiry', 'Pro Expires'),
            mode: {
              type: 'label',
              label: userInfo ? (isLoading ? 'Loading...' : formatExpiryDate(userInfo.expiresAt)) : '-',
            },
          },
        ]}
      ></ListItemGroup>

      <AppleStorePurchase
        userInfo={userInfo}
        onPurchase={async () => {
          setIsLoading(true);
          try {
            await cloudService.checkAndInsertPurchaseHistory();
            await mutateUserInfo();
          } catch (error) {
            toast({
              message: localize('account.purchase.error', 'Failed to complete purchase {0}', (error as Error).message),
            });
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <OtherPurchase />

      <ListItemGroup
        className="mt-8"
        items={[
          {
            title: localize('account.logout', 'Log out'),
            mode: {
              type: 'button',
              theme: 'primary',
              align: 'center',
            },
            onClick: handleLogout,
          },
          {
            title: localize('account.delete', 'Delete Account'),
            mode: {
              type: 'button',
              theme: 'danger',
              align: 'center',
            },
            onClick: handleDeleteAccount,
          },
        ]}
      />
    </PageLayout>
  );
};
