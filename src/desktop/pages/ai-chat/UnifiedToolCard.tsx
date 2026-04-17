import { ChevronRightIcon, CircleXIcon, CloseIcon, CircleHelpIcon, LogIcon, Loader2Icon } from '@/components/icons';
import { localize } from '@/nls';
import type { UIToolCallInfo } from '@/services/ai/browser/types';
import { getToolConfig } from '@/services/ai/browser/tools/tools';
import React, { useState } from 'react';

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
      <span className="flex items-center gap-1 text-xs text-t3">
        <Loader2Icon className="size-3.5 animate-spin flex-shrink-0" />
        {localize('ai_chat.executing', 'Executing...')}
      </span>
    );
  }

  if (toolCall.type === 'confirm') {
    if (toolCall.status === 'confirmed') {
      return (
        <span className="flex items-center gap-1 text-xs text-accent-success">
          <LogIcon className="size-3.5 flex-shrink-0" />
          {localize('ai_chat.success', 'Success')}
        </span>
      );
    }

    if (toolCall.status === 'rejected') {
      return (
        <span className="flex items-center gap-1 text-xs text-t3">
          <CloseIcon className="size-3.5 flex-shrink-0" />
          {localize('ai_chat.canceled', 'Canceled')}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-xs text-accent-warning">
        <CircleHelpIcon className="size-3.5 flex-shrink-0" />
        {localize('ai_chat.awaiting_confirm', 'Awaiting')}
      </span>
    );
  }

  if (toolCall.status === 'pending') {
    return (
      <span className="flex items-center gap-1 text-xs text-t3">
        <Loader2Icon className="size-3.5 animate-spin flex-shrink-0" />
        {localize('ai_chat.executing', 'Executing...')}
      </span>
    );
  }

  if (toolCall.status === 'executed' && toolCall.result?.success) {
    return (
      <span className="flex items-center gap-1 text-xs text-accent-success">
        <LogIcon className="size-3.5 flex-shrink-0" />
        {localize('ai_chat.success', 'Success')}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-accent-danger">
      <CircleXIcon className="size-3.5 flex-shrink-0" />
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
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1 py-1.5 text-xs text-t3 transition-colors hover:text-t1"
      >
        <span className="flex-1 text-left">{title}</span>
        <ChevronRightIcon className={`size-3.5 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <pre className="mb-1 overflow-x-auto break-all whitespace-pre-wrap rounded-md bg-bg3 px-2 py-1.5 font-mono text-xs leading-5 text-t1">
          {content}
        </pre>
      )}
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
    <div className="overflow-hidden rounded-md border border-line-light bg-bg2">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="flex-1 truncate text-sm font-medium text-t1">{toolName}</span>
        <ToolStatus toolCall={toolCall} />
      </div>
      <div className="flex flex-col px-3 pb-2">
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
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onConfirm}
              className="rounded-md bg-brand px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90"
            >
              {localize('ai_chat.confirm', 'Confirm')}
            </button>
            <button
              onClick={onReject}
              className="rounded-md border border-line-light bg-bg1 px-3 py-1.5 text-xs text-t1 transition-colors hover:bg-bg3"
            >
              {localize('ai_chat.cancel', 'Cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
