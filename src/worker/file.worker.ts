import { FileWrieOperationMessage } from "./messages";

self.onmessage = async (e: MessageEvent) => {
  const message = JSON.parse(e.data);
  const fileMessage = message as FileWrieOperationMessage;

  const root = await navigator.storage.getDirectory();
  const file = await root.getFileHandle(fileMessage.file);
  
  const base64 = fileMessage.data.split('base64,')[1];
  const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

  const accessHandle = await file.createSyncAccessHandle();
  accessHandle.write(data.buffer, { at: 0 });
  accessHandle.flush();
  accessHandle.close();
};
