import { HttpError } from '@/packages/cloud/error.ts';
import { localize } from '@/nls.ts';

export class CancelError extends Error {
  constructor(message = 'Operation was cancelled') {
    super(message);
    this.name = 'CancelError';
  }
}

const otherError = localize('otherError', 'An error occurred');

export function getLoginErrorMessage(error: Error) {
  try {
    if (error instanceof HttpError) {
      if (error.code === 'E01C002') {
        return localize('login.error.accountExists', 'Account already exists');
      } else if (error.code === 'E00C001') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (error.details.some((o: any) => o.path.includes('account'))) {
          return localize('login.error.accountFormat', 'Please enter a valid email format.');
        } else {
          return error.message;
        }
      } else {
        return error.message;
      }
    } else {
      return (error as Error).message || otherError;
    }
  } catch (error) {
    return (error as Error).message || otherError;
  }
}

export function getDeleteDatabaseErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    // wrong password
    if (error.code === 'E02C001') {
      return localize('deleteDatabase.error.wrongPassword', 'Wrong password');
    }
    if (error.code === 'E02C003') {
      return localize('deleteDatabase.error.limit', 'You can only create 3 databases');
    }
  }
  return '';
}
