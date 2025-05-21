// File System Access API types
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }
}

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
  queryPermission(options: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission(options: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  remove(): Promise<void>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getFileHandle(name: string, options?: { create: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create: boolean }): Promise<FileSystemDirectoryHandle>;
  removeEntry(name: string, options?: { recursive: boolean }): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  queryPermission(options: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission(options: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  values(): AsyncIterableIterator<FileSystemHandle>;
  keys(): AsyncIterableIterator<string>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

type PermissionState = 'granted' | 'denied' | 'prompt';

// Application specific types
export interface DuplicateImage {
  original: {
    fileHandle: FileSystemFileHandle;
    folder: string;
    name: string;
    file: File;
  };
  duplicate: {
    fileHandle: FileSystemFileHandle;
    folder: string;
    name: string;
    file: File;
  };
  similarity: number;
}

export type { FileSystemFileHandle, FileSystemDirectoryHandle, FileSystemHandle }; 