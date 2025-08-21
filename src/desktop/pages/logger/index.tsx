import { LogIcon } from '@/components/icons';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { IWebLoggerService, LogEntry } from '@/services/weblogger/common/webloggerService';
import React, { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

interface LogItemProps {
  index: number;
  style: React.CSSProperties;
  data: LogEntry[];
}

const LogItem: React.FC<LogItemProps> = ({ index, style, data }) => {
  const log = data[index];
  const timestamp = new Date(log.timestamp);
  const timeString = timestamp.toLocaleTimeString('en-US', { hour12: false });
  const dateString = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const levelStyles = {
    debug: {
      dot: 'bg-blue-500',
      text: 'text-blue-700',
      bg: 'bg-blue-50/50',
    },
    log: {
      dot: 'bg-green-500',
      text: 'text-green-700',
      bg: 'bg-green-50/50',
    },
    error: {
      dot: 'bg-stress-red',
      text: 'text-stress-red',
      bg: 'bg-stress-red/50',
    },
  };

  const levelStyle = levelStyles[log.level];
  const isError = log.level === 'error';

  return (
    <div
      style={style}
      className={`px-4 py-1.5 border-b border-line-regular transition-colors ${isError ? 'text-stress-red/20' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${levelStyle.dot}`} />
          <div className="text-xs text-t3 font-mono min-w-[60px]">{timeString}</div>
        </div>

        <div
          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${levelStyle.text} ${levelStyle.bg} border border-current/20`}
        >
          {log.level.toUpperCase()}
        </div>

        <div className="flex-1 text-sm text-t1 leading-relaxed break-words">{log.message}</div>

        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-t3">
          <span className="opacity-60">{dateString}</span>
          <span className="opacity-40 font-mono">
            {log.instanceId}/{log.tabId}
          </span>
        </div>
      </div>
    </div>
  );
};

export const Logs = () => {
  const webLoggerService = useService(IWebLoggerService);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const allLogs = await webLoggerService.exportAll();
        setLogs(allLogs);
      } catch (error) {
        console.error('Failed to load logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [webLoggerService]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const allLogs = await webLoggerService.exportAll();
      setLogs(allLogs);
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const allLogs = await webLoggerService.exportAll();

      // Format logs for export
      const exportData = JSON.stringify(allLogs);

      // Create and download file
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const actions = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      handleClick: handleRefresh,
      title: localize('logs.refresh', 'Refresh'),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      handleClick: handleExport,
      title: localize('logs.export', 'Export Logs'),
    },
  ];

  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <EntityHeader
          renderIcon={() => <LogIcon className="size-5 text-t2" />}
          title={localize('logs.title', 'Logs')}
          actions={actions}
        />

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 mx-auto border-2 text-t3 border-t-brand rounded-full animate-spin" />
                <div className="text-t3">{localize('logs.loading', 'Loading logs...')}</div>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto text-t4 rounded-full flex items-center justify-center">
                  <LogIcon className="w-8 h-8 text-t3" />
                </div>
                <p className="text-t3 text-lg">{localize('logs.noLogs', 'No logs available')}</p>
                <p className="text-t3 text-sm opacity-75">
                  {localize('logs.noLogsDesc', 'Logs will appear here as they are generated')}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-bg1">
              <div className="px-4 py-3 border-b border-line-regular bg-bg2/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-t2 font-medium">
                      {localize('logs.totalCount', 'Total: {0} logs', logs.length)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-stress-red" />
                      <span className="text-xs text-t3">Error</span>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-t3">Log</span>
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-t3">Debug</span>
                    </div>
                  </div>
                  <div className="text-xs text-t3">
                    {localize('logs.sortInfo', 'Sorted by timestamp and creation order')}
                  </div>
                </div>
              </div>
              <List
                height={window.innerHeight - 160}
                itemCount={logs.length}
                itemSize={50}
                itemData={logs}
                width="100%"
              >
                {LogItem}
              </List>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
