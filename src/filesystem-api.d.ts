// Patching TS - I Solemnly Swear I Know This Is There

interface FileSystemFileHandle {
  createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>;
}