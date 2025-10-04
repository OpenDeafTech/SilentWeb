// types/chrome.d.ts
declare namespace chrome {
  namespace runtime {
    function sendMessage(
      message: any,
      responseCallback?: (response: any) => void
    ): void;

    function getURL(path: string): string;
    const id: string;
  }

  namespace storage {
    namespace local {
      function get(
        keys: null | string | string[] | Record<string, any>,
        callback: (items: Record<string, any>) => void
      ): void;

      function set(
        items: Record<string, any>,
        callback?: () => void
      ): void;
    }
  }

  namespace tabs {
    function sendMessage(
      tabId: number,
      message: any,
      responseCallback?: (response: any) => void
    ): void;
  }
}
