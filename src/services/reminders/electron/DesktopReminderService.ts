import { checkPlatform } from '@/base/browser/checkPlatform';
import { ITaskModelData, ReminderWithId } from '@/core/type';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { IReminderService } from '../common/reminderService';

export class DesktopReminderService implements IReminderService {
  readonly _serviceBrand: undefined;

  constructor(@ITodoService private todoService: ITodoService) {}

  async start(): Promise<void> {
    if (!checkPlatform().isElectron) {
      return;
    }
    setInterval(() => {
      this.run();
    }, 5000); // Check every second for more precise timing
  }

  private run() {
    this._run().catch((error) => {
      console.error('Error running mobile reminder service:', error);
    });
  }

  async _run(): Promise<void> {
    console.log('Running desktop reminder service...');
    const reminders = this.todoService.getReminders();
    const modelState = this.todoService.modelState;
    const now = new Date();

    const justExpiredTasks: Array<{ taskId: string; reminder: ReminderWithId }> = [];

    reminders.forEach((reminderList, taskId) => {
      reminderList.forEach((reminder) => {
        const reminderTime = new Date(reminder.time);
        const timeDiff = now.getTime() - reminderTime.getTime();

        if (timeDiff >= 0 && timeDiff <= 5000) {
          justExpiredTasks.push({ taskId, reminder });
        }
      });
    });

    if (justExpiredTasks.length > 0) {
      console.log('Just expired tasks:', justExpiredTasks);
      await this.sendWebNotifications(justExpiredTasks, modelState);
    }
  }

  private async sendWebNotifications(
    expiredTasks: Array<{ taskId: string; reminder: ReminderWithId }>,
    modelState: ITaskModelData
  ): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Send notification for each expired task
    expiredTasks.forEach(({ taskId, reminder }) => {
      const taskItem = modelState.taskObjectMap.get(taskId);
      if (!taskItem) return;

      const title = localize('reminder.expired.title', 'Task Reminder');
      const body = taskItem.title;

      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico', // You may want to adjust this path
        tag: `reminder-${taskId}-${reminder.reminderId}`, // Prevent duplicate notifications
        requireInteraction: true, // Keep notification visible until user interacts
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    });
  }
}
