import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc.ts';
import { AIIcon, CalendarIcon, CheckIcon, InboxIcon, SquareTerminalIcon, TodayIcon } from '@/components/icons';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { useConfig } from '@/hooks/useConfig';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import { ICliApprovalService } from '@/services/cliApproval/common/cliApprovalService';
import { hideAIEntryConfigKey } from '@/services/config/config';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';
import { desktopStyles } from '../../../theme/main';
import { MenuItem } from '../../MenuItem/MenuItem.tsx';

const aiChatLink = { to: '/desktop/ai-chat', text: localize('ai_chat', 'AI Chat'), icon: <AIIcon strokeWidth={1.5} /> };
const approvalsLink = {
  to: '/desktop/approvals',
  text: localize('cliApproval.title', 'Approvals'),
  icon: <SquareTerminalIcon />,
};
const baseLinks = [
  { to: '/desktop/inbox', text: localize('inbox', 'Inbox'), icon: <InboxIcon /> },
  { to: '/desktop/today', text: localize('today', 'Today'), icon: <TodayIcon /> },
  { to: '/desktop/schedule', text: localize('schedule', 'Schedule'), icon: <CalendarIcon /> },
  { to: '/desktop/completed', text: localize('completed', 'Completed'), icon: <CheckIcon /> },
];

export const SidebarMenu: React.FC = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const cliApprovalService = useService(ICliApprovalService);
  useWatchEvent(cliApprovalService.onChange);
  const pendingApprovalCount = cliApprovalService.requests.reduce((count, request) => count + request.ops.length, 0);
  const { value: hideAIEntry } = useConfig(hideAIEntryConfigKey());
  // Always present, pending or not: with nothing queued the page explains how
  // to connect an AI agent, which is exactly what someone who has never seen an
  // approval needs.
  const links = [...(hideAIEntry ? [] : [aiChatLink]), ...baseLinks, approvalsLink];
  const todayItems = getTodayItems(todoService.modelState, getTodayTimestampInUtc());
  const { showFutureTasks, showCompletedTasks, completedAfter } = useTaskDisplaySettings('inbox');
  const { uncompletedTasksCount } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });

  return (
    <ul className={desktopStyles.SidebarMenuItemContainer}>
      {links.map((link, index) => {
        const isTodayLink = link.to === '/desktop/today';
        const isInboxLink = link.to === '/desktop/inbox';
        const isApprovalsLink = link.to === '/desktop/approvals';
        const startDateCount = isTodayLink ? todayItems.startDateItemsCount : 0;
        const dueDateCount = isTodayLink ? todayItems.dueDateItemsCount : 0;
        return (
          <MenuItem
            key={index}
            to={link.to}
            text={link.text}
            icon={link.icon}
            primaryBadge={isTodayLink && dueDateCount > 0 ? dueDateCount : undefined}
            secondaryBadge={
              isTodayLink && startDateCount > 0
                ? startDateCount
                : isInboxLink && uncompletedTasksCount > 0
                  ? uncompletedTasksCount
                  : isApprovalsLink
                    ? pendingApprovalCount
                    : undefined
            }
          />
        );
      })}

      <div className={desktopStyles.SidebarMenuDivider}></div>
    </ul>
  );
};
