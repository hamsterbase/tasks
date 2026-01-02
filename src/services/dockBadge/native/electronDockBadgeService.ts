import { checkPlatform } from '@/base/browser/checkPlatform';
import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { IConfigService } from '@/services/config/configService';
import { dockBadgeCountTypeConfigKey } from '@/services/config/config';
import { ITodoService } from '@/services/todo/common/todoService';
import { IDockBadgeService } from '../common/dockBadgeService';
import { ElectronDockBadgeServiceClient } from '../electron/dockBadgeService-ipc';

export class ElectronDockBadgeService implements IDockBadgeService {
  readonly _serviceBrand: undefined;
  private readonly client = new ElectronDockBadgeServiceClient();

  constructor(
    @ITodoService private todoService: ITodoService,
    @IConfigService private configService: IConfigService
  ) {}

  async start(): Promise<void> {
    // Only run on Electron + macOS
    if (!checkPlatform().isElectron || !checkPlatform().isMac) {
      return;
    }

    // Subscribe to state changes
    this.todoService.onStateChange(() => {
      this.updateBadge().catch((error) => {
        console.error('Error updating dock badge:', error);
      });
    });

    // Subscribe to config changes
    this.configService.onConfigChange((event) => {
      if (event.key === dockBadgeCountTypeConfigKey().key) {
        this.updateBadge().catch((error) => {
          console.error('Error updating dock badge after config change:', error);
        });
      }
    });

    // Initial update
    await this.updateBadge();
  }

  private async updateBadge(): Promise<void> {
    const countType = this.configService.get(dockBadgeCountTypeConfigKey());

    // If type is 'none', clear badge
    if (countType === 'none') {
      await this.client.setBadge(0);
      return;
    }

    const today = getTodayTimestampInUtc();
    const todayItems = getTodayItems(this.todoService.modelState, today);
    const dueDateCount = todayItems.dueDateItemsCount; // 到期的任务
    const startDateCount = todayItems.startDateItemsCount; // 今天开始的任务

    let totalCount = 0;

    switch (countType) {
      case 'overdue': {
        // 过期项
        totalCount = dueDateCount;
        break;
      }
      case 'overdue_and_today': {
        // 过期 + 今天
        totalCount = dueDateCount + startDateCount;
        break;
      }
      case 'overdue_today_and_inbox': {
        // 到期 + 今天 + 收件箱
        const { uncompletedTasksCount } = getInboxTasks(this.todoService.modelState, {
          currentDate: today,
          showFutureTasks: false,
          showCompletedTasks: false,
          showCompletedTasksAfter: 0,
          keepAliveElements: this.todoService.keepAliveElements,
        });
        totalCount = dueDateCount + startDateCount + uncompletedTasksCount;
        break;
      }
    }

    // Update badge via IPC
    await this.client.setBadge(totalCount);
  }
}
