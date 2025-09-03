import React from 'react';
import { SettingsIcon } from '../../../components/icons';
import { localize } from '../../../nls';
import { PageLayout } from '../../components/PageLayout';

export const FeedbackPage = () => {
  return (
    <PageLayout
      header={{
        id: 'feedback',
        title: localize('settings.feedback', 'Customer Feedback'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      <div className="p-4">
        <p className="text-t1 text-sm mb-4">
          {localize(
            'settings.feedback.description',
            'If you have any questions, suggestions, or issues, please feel free to contact our support team.'
          )}
        </p>
        <p className="text-t1 text-sm font-medium">support@hamsterbase.com</p>
      </div>
    </PageLayout>
  );
};
