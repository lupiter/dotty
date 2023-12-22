import { FileWrieOperationMessage } from "./messages";

self.onmessage = async (e: MessageEvent) => {
  const message = JSON.parse(e.data);

  if ("operation" in message) {
    const fileMessage = message as FileWrieOperationMessage;

    const root = await navigator.storage.getDirectory();
    const file = await root.getFileHandle(fileMessage.file);

    const accessHandle = await file.createSyncAccessHandle();
    const encoder = new TextEncoder();
    const writeBuffer = encoder.encode(fileMessage.data);
    accessHandle.write(writeBuffer, { at: 0 });
    accessHandle.flush();
    accessHandle.close();
  }
};
