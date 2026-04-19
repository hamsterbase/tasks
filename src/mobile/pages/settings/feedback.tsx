import React from 'react';
import { SettingsIcon } from '../../../components/icons';
import { localize } from '../../../nls';
import { PageLayout } from '../../components/PageLayout';
import { styles } from '../../theme';

export const FeedbackPage = () => {
  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'feedback',
        title: localize('settings.feedback', 'Customer Feedback'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <div className={styles.settingsPageContent}>
        <p className={`${styles.settingsPageText} ${styles.settingsPageParagraphSpacing}`}>
          {localize(
            'settings.feedback.description',
            'If you have any questions, suggestions, or issues, please feel free to contact our support team.'
          )}
        </p>
        <p className={styles.settingsPageEmphasisText}>support@hamsterbase.com</p>
      </div>
    </PageLayout>
  );
};
