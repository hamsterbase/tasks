import { ReminderWithId } from '@/core/type';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { format } from 'date-fns';
import { IReminderService } from '../common/reminderService';
import { checkPlatform } from '@/base/browser/checkPlatform';

export class MobileReminderService implements IReminderService {
  readonly _serviceBrand: undefined;

  constructor(@ITodoService private todoService: ITodoService) {}

  async start(): Promise<void> {
    if (checkPlatform().isWeb) {
      return;
    }
    if (!checkPlatform().isAndroid && !checkPlatform().isIOS) {
      return;
    }
    this.run();
    this.todoService.onStateChange(() => {
      this.run().catch((error) => {
        console.error('Error updating mobile reminders on state change:', error);
      });
    });
  }

  async run(): Promise<void> {
    const reminders = this.todoService.getReminders();
    const modelState = this.todoService.modelState;

    const now = new Date();
    const futureReminders: Array<{ taskId: string; reminder: ReminderWithId }> = [];

    reminders.forEach((reminderList, taskId) => {
      reminderList.forEach((reminder) => {
        if (new Date(reminder.time) > now) {
          futureReminders.push({ taskId, reminder });
        }
      });
    });

    if (futureReminders.length > 0) {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display === 'prompt') {
        const request = await LocalNotifications.requestPermissions();
        if (request.display !== 'granted') {
          throw new Error(localize('notification.permission.denied', 'Notification permission denied'));
        }
      } else if (permission.display === 'denied') {
        throw new Error(localize('notification.permission.denied', 'Notification permission denied'));
      }
    }

    const existingNotifications = await LocalNotifications.getPending();

    existingNotifications.notifications.forEach((n) => {
      if (typeof n.schedule?.at === 'string') {
        n.schedule!.at = new Date(n.schedule!.at);
      }
    });

    const newNotifications: LocalNotificationSchema[] = futureReminders
      .map(({ taskId, reminder }) => {
        const taskItem = modelState.taskObjectMap.get(taskId);
        if (!taskItem) return null;
        const title = taskItem.title;
        let notes = '';
        if (taskItem.type === 'task') {
          notes = taskItem.notes || '';
        }
        if (taskItem.type === 'project') {
          notes = taskItem.notes || '';
        }
        const scheduledAt = new Date(reminder.time);
        return {
          id: Math.floor(Math.random() * 100000),
          title,
          body: notes,
          schedule: { at: scheduledAt },
        };
      })
      .filter((notification) => notification !== null);

    const existingNotificationMap = new Map(
      existingNotifications.notifications.map((n) => [this.formatNotificationDetails(n), n.id])
    );
    const newNotificationMap = new Map(newNotifications.map((n) => [this.formatNotificationDetails(n), n]));

    const notificationsToCancel: number[] = [];
    for (const [key, id] of existingNotificationMap) {
      if (!newNotificationMap.has(key)) {
        notificationsToCancel.push(id);
      }
    }

    const notificationsToSchedule: LocalNotificationSchema[] = [];
    for (const [key, notification] of newNotificationMap) {
      if (!existingNotificationMap.has(key)) {
        notificationsToSchedule.push(notification);
      }
    }

    if (notificationsToCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: notificationsToCancel.map((id) => ({ id })) });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  }

  private formatNotificationDetails(notification: LocalNotificationSchema): string {
    let scheduledAt = notification.schedule?.at;
    if (typeof scheduledAt === 'string') {
      scheduledAt = new Date(scheduledAt);
    }
    const formattedTime = scheduledAt instanceof Date ? format(scheduledAt, 'yyyy MM dd HH mm') : '';
    return `${notification.title} ${notification.body} ${formattedTime}`;
  }
}
