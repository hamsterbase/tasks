export class HttpError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string | number,
    public details?: any
  ) {
    super(message);
  }
}
