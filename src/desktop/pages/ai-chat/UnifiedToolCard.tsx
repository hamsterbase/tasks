import { ChevronRightIcon, CircleXIcon, CloseIcon, CircleHelpIcon, LogIcon, Loader2Icon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import type { UIToolCallInfo } from '@/services/ai/browser/types';
import { getToolConfig } from '@/services/ai/browser/tools/tools';
import React, { useState } from 'react';

const getToolStatusClassName = (tone: 'neutral' | 'success' | 'warning' | 'danger') =>
  `${desktopStyles.AIChatToolStatusBase} ${
    {
      neutral: desktopStyles.AIChatToolStatusToneNeutral,
      success: desktopStyles.AIChatToolStatusToneSuccess,
      warning: desktopStyles.AIChatToolStatusToneWarning,
      danger: desktopStyles.AIChatToolStatusToneDanger,
    }[tone]
  }`;

interface UnifiedToolCardProps {
  toolCall: UIToolCallInfo;
  onConfirm?: () => void;
  onReject?: () => void;
}

type ExpandableSection = 'params' | 'result';

const sanitizeArguments = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  const rest = { ...(value as Record<string, unknown>) };
  delete rest._meta;
  return rest;
};

const formatArguments = (toolCall: UIToolCallInfo) => {
  if (toolCall.status === 'streaming') {
    return toolCall.argumentsJson;
  }

  const sanitized = sanitizeArguments(toolCall.arguments);
  if (typeof sanitized === 'string') {
    return sanitized;
  }

  return JSON.stringify(sanitized, null, 2);
};

const getResultText = (toolCall: UIToolCallInfo) => {
  if (!('result' in toolCall) || !toolCall.result) {
    return undefined;
  }

  return toolCall.result.formattedResultForUser || toolCall.result.formattedResult;
};

const showResultSection = (toolCall: UIToolCallInfo) => {
  if (!('result' in toolCall) || !toolCall.result || toolCall.result.hideResult) {
    return false;
  }

  return (toolCall.type === 'auto' && toolCall.status === 'executed') || toolCall.status === 'confirmed';
};

const ToolStatus: React.FC<{ toolCall: UIToolCallInfo }> = ({ toolCall }) => {
  if (toolCall.status === 'streaming') {
    return (
      <span className={getToolStatusClassName('neutral')}>
        <Loader2Icon className={desktopStyles.AIChatToolStatusLoadingIcon} />
        {localize('ai_chat.executing', 'Executing...')}
      </span>
    );
  }

  if (toolCall.type === 'confirm') {
    if (toolCall.status === 'confirmed') {
      return (
        <span className={getToolStatusClassName('success')}>
          <LogIcon className={desktopStyles.AIChatToolStatusIcon} />
          {localize('ai_chat.success', 'Success')}
        </span>
      );
    }

    if (toolCall.status === 'rejected') {
      return (
        <span className={getToolStatusClassName('neutral')}>
          <CloseIcon className={desktopStyles.AIChatToolStatusIcon} />
          {localize('ai_chat.canceled', 'Canceled')}
        </span>
      );
    }

    return (
      <span className={getToolStatusClassName('warning')}>
        <CircleHelpIcon className={desktopStyles.AIChatToolStatusIcon} />
        {localize('ai_chat.awaiting_confirm', 'Awaiting')}
      </span>
    );
  }

  if (toolCall.status === 'pending') {
    return (
      <span className={getToolStatusClassName('neutral')}>
        <Loader2Icon className={desktopStyles.AIChatToolStatusLoadingIcon} />
        {localize('ai_chat.executing', 'Executing...')}
      </span>
    );
  }

  if (toolCall.status === 'executed' && toolCall.result?.success) {
    return (
      <span className={getToolStatusClassName('success')}>
        <LogIcon className={desktopStyles.AIChatToolStatusIcon} />
        {localize('ai_chat.success', 'Success')}
      </span>
    );
  }

  return (
    <span className={getToolStatusClassName('danger')}>
      <CircleXIcon className={desktopStyles.AIChatToolStatusIcon} />
      {localize('ai_chat.failed', 'Failed')}
    </span>
  );
};

interface ToolSectionProps {
  title: string;
  content: string;
  expanded: boolean;
  onToggle: () => void;
}

const ToolSection: React.FC<ToolSectionProps> = ({ title, content, expanded, onToggle }) => {
  return (
    <>
      <button onClick={onToggle} className={desktopStyles.AIChatToolSectionButton}>
        <span className={desktopStyles.AIChatToolSectionTitle}>{title}</span>
        <ChevronRightIcon
          className={`${desktopStyles.AIChatToolSectionChevron} ${
            expanded ? desktopStyles.AIChatToolSectionChevronExpanded : ''
          }`}
        />
      </button>
      {expanded && <pre className={desktopStyles.AIChatToolSectionContent}>{content}</pre>}
    </>
  );
};

export const UnifiedToolCard: React.FC<UnifiedToolCardProps> = ({ toolCall, onConfirm, onReject }) => {
  const [expandedSections, setExpandedSections] = useState<Record<ExpandableSection, boolean>>({
    params: false,
    result: false,
  });

  const toggleSection = (section: ExpandableSection) => {
    setExpandedSections((value) => ({
      ...value,
      [section]: !value[section],
    }));
  };

  const toolName = getToolConfig(toolCall.name)?.displayName || toolCall.name;
  const resultText = getResultText(toolCall);

  return (
    <div className={desktopStyles.AIChatToolCard}>
      <div className={desktopStyles.AIChatToolCardHeader}>
        <span className={desktopStyles.AIChatToolCardTitle}>{toolName}</span>
        <ToolStatus toolCall={toolCall} />
      </div>
      <div className={desktopStyles.AIChatToolCardBody}>
        <ToolSection
          title={localize('ai_chat.parameters', 'Parameters')}
          content={formatArguments(toolCall)}
          expanded={expandedSections.params}
          onToggle={() => toggleSection('params')}
        />
        {showResultSection(toolCall) && resultText && (
          <ToolSection
            title={localize('ai_chat.result', 'Result')}
            content={resultText}
            expanded={expandedSections.result}
            onToggle={() => toggleSection('result')}
          />
        )}
        {toolCall.type === 'confirm' && toolCall.status === 'pending' && onConfirm && onReject && (
          <div className={desktopStyles.AIChatToolCardActions}>
            <button onClick={onConfirm} className={desktopStyles.AIChatToolCardConfirmButton}>
              {localize('ai_chat.confirm', 'Confirm')}
            </button>
            <button onClick={onReject} className={desktopStyles.AIChatToolCardCancelButton}>
              {localize('ai_chat.cancel', 'Cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
