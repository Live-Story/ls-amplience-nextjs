export {};

declare global {
  interface Window {
    LiveStory?: new (
      elementId: string,
      options?: { type?: string },
    ) => unknown;
  }
}
