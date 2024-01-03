const readFile = async (file: File): Promise<string> => {
  const reader = new FileReader();
  const promise = new Promise<string>((resolve, reject) => {
    reader.addEventListener("load", () => {
      resolve(reader.result as string);
    });
    reader.addEventListener("error", (e) => {
      reject(e);
    });
    reader.readAsDataURL(file);
  });
  return promise;
};

export type FilePreview = {
  meta: FileSystemFileHandle;
  preview: string;
};

export const getFiles = async (): Promise<FilePreview[]> => {
  const root = await navigator.storage.getDirectory();
  const files: FilePreview[] = [];
  for await (const handle of root.values()) {
    if (handle.kind === "file") {
      const file = handle as FileSystemFileHandle;
      files.push({
        meta: file,
        preview: await readFile(await file.getFile()),
      });
    }
  }
  return files;
};
