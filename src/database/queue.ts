type QueuedOperation<T> = () => Promise<T>;

export class OperationQueue<T> {
  private readonly queue: QueuedOperation<T>[] = [];
  private isProcessing = false;

  enqueue(operation: QueuedOperation<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const operation = this.queue.shift()!;
      await operation();
    }
    this.isProcessing = false;
  }
}
