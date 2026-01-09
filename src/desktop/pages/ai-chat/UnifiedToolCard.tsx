import React, { useState } from 'react';
import { localize } from '@/nls';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CloseIcon,
  AlertCircleIcon,
  SyncIcon,
} from '@/components/icons';
import { UIToolCallInfo } from '@/services/ai/browser/types';
import { getToolConfig } from '@/services/ai/browser/tools/tools';
import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

interface UnifiedToolCardProps {
  toolCall: UIToolCallInfo;
  onConfirm?: () => void;
  onReject?: () => void;
}

function getTitle(toolCall: UIToolCallInfo): string {
  if (toolCall.status === 'streaming') {
    try {
      const metaTitleMatch = toolCall.argumentsJson.match(/"_meta"\s*:\s*\{[^}]*"title"\s*:\s*"([^"]+)"/);
      if (metaTitleMatch) {
        return metaTitleMatch[1];
      }
      const titleMatch = toolCall.argumentsJson.match(/"title"\s*:\s*"([^"]+)"/);
      if (titleMatch) {
        return titleMatch[1];
      }
    } catch {
      // Ignore parse errors
    }
    return localize('ai_chat.preparing', 'Preparing...');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (toolCall.arguments as any)._meta?.title || '';
}

function getFormattedArguments(toolCall: UIToolCallInfo, instantiationService: IInstantiationService): string {
  if (toolCall.status === 'streaming') {
    return toolCall.argumentsJson;
  }
  const config = getToolConfig(toolCall.name);
  if (config?.formatArguments) {
    return config.formatArguments(toolCall.arguments, instantiationService);
  }
  return JSON.stringify(toolCall.arguments, null, 2);
}

const StatusBadge: React.FC<{ toolCall: UIToolCallInfo }> = ({ toolCall }) => {
  if (toolCall.status === 'streaming') {
    return (
      <span className="flex items-center gap-1 text-xs text-t3">
        <SyncIcon className="size-3 animate-spin" />
        {localize('ai_chat.generating', 'Generating...')}
      </span>
    );
  }

  if (toolCall.type === 'confirm') {
    if (toolCall.status === 'confirmed') {
      return (
        <span className="flex items-center gap-1 text-xs text-success-green">
          <CircleCheckIcon className="size-3" />
          {localize('ai_chat.executed_success', 'Executed')}
        </span>
      );
    }
    if (toolCall.status === 'rejected') {
      return (
        <span className="flex items-center gap-1 text-xs text-t3">
          <CloseIcon className="size-3" />
          {localize('ai_chat.canceled', 'Canceled')}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs text-brand">
        <AlertCircleIcon className="size-3" />
        {localize('ai_chat.awaiting_confirm', 'Awaiting')}
      </span>
    );
  }

  if (toolCall.type === 'auto') {
    if (toolCall.status === 'pending') {
      return (
        <span className="flex items-center gap-1 text-xs text-brand">
          <SyncIcon className="size-3 animate-spin" />
          {localize('ai_chat.executing', 'Executing...')}
        </span>
      );
    }
    if (toolCall.status === 'executed' && toolCall.result) {
      if (toolCall.result.success) {
        return (
          <span className="flex items-center gap-1 text-xs text-success-green">
            <CircleCheckIcon className="size-3" />
            {localize('ai_chat.executed_success', 'Executed')}
          </span>
        );
      } else {
        return (
          <span className="flex items-center gap-1 text-xs text-stress-red">
            <CloseIcon className="size-3" />
            {localize('ai_chat.failed', 'Failed')}
          </span>
        );
      }
    }
  }

  return null;
};

interface CollapsibleSectionProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, content, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 py-1.5 text-left"
      >
        <span className="text-sm text-t2 truncate">{title}</span>
        {isExpanded ? (
          <ChevronDownIcon className="size-4 text-t3 flex-shrink-0" />
        ) : (
          <ChevronRightIcon className="size-4 text-t3 flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 bg-bg3 rounded p-2 text-xs font-mono overflow-x-auto">
          <pre className="whitespace-pre-wrap text-t2 select-text">{content}</pre>
        </div>
      )}
    </div>
  );
};

export const UnifiedToolCard: React.FC<UnifiedToolCardProps> = ({ toolCall, onConfirm, onReject }) => {
  const instantiationService = useService(IInstantiationService);
  const isStreaming = toolCall.status === 'streaming';
  const isConfirmPending = toolCall.type === 'confirm' && toolCall.status === 'pending';
  const showResult =
    ((toolCall.type === 'auto' && toolCall.status === 'executed' && toolCall.result) ||
      (toolCall.type === 'confirm' && toolCall.status === 'confirmed' && toolCall.result)) &&
    !('result' in toolCall && toolCall.result?.hideResult);

  const title = getTitle(toolCall);
  const formattedArgs = getFormattedArguments(toolCall, instantiationService);
  // confirm type defaults to expanded, others default to collapsed
  const defaultExpanded = toolCall.type === 'confirm';

  return (
    <div className="my-2 border border-line-light rounded-lg overflow-hidden bg-bg1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-bg1">
        <span className="text-sm font-medium text-t1">
          {getToolConfig(toolCall.name)?.displayName || toolCall.name}
        </span>
        <StatusBadge toolCall={toolCall} />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Arguments Section */}
        {isStreaming ? (
          <div className="text-sm text-t3 select-text">{title}</div>
        ) : (
          <CollapsibleSection title={title} content={formattedArgs} defaultExpanded={defaultExpanded} />
        )}

        {/* Divider */}
        {showResult && <div className="border-t border-line-light" />}

        {/* Result Section */}
        {showResult && 'result' in toolCall && toolCall.result && (
          <>
            <CollapsibleSection
              title={toolCall.result.resultSummary}
              content={toolCall.result.formattedResultForUser || toolCall.result.formattedResult}
              defaultExpanded={false}
            />
          </>
        )}

        {/* Actions */}
        {isConfirmPending && onConfirm && onReject && (
          <div className="flex gap-2 pt-2 border-t border-line-light">
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 bg-brand text-white rounded-md text-sm hover:bg-brand/90"
            >
              {localize('ai_chat.confirm', 'Confirm')}
            </button>
            <button onClick={onReject} className="px-3 py-1.5 bg-bg3 text-t1 rounded-md text-sm hover:bg-bg2">
              {localize('ai_chat.cancel', 'Cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
