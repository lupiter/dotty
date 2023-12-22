/////////////////////////////
/// Window Async Iterable APIs
/////////////////////////////

// Patching https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1639

interface FileSystemDirectoryHandle {
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<FileSystemHandle>;
}