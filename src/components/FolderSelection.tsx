import React from 'react';
import { FileSystemDirectoryHandle } from '../types';

interface FolderSelectionProps {
  folder1Handle: FileSystemDirectoryHandle | null;
  folder2Handle: FileSystemDirectoryHandle | null;
  onFolderSelect: (folderNumber: 1 | 2) => Promise<void>;
  onFindDuplicates: () => Promise<void>;
  onClear: () => void;
  isLoading: boolean;
}

const FolderSelection: React.FC<FolderSelectionProps> = ({
  folder1Handle,
  folder2Handle,
  onFolderSelect,
  onFindDuplicates,
  onClear,
  isLoading
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">
          <i className="bi bi-folder2-open"></i>
          Select Folders
        </h2>
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <button
              className="btn btn-primary w-100"
              onClick={() => onFolderSelect(1)}
              disabled={isLoading}
            >
              <i className="bi bi-folder-plus me-2"></i>
              Select Folder 1
            </button>
            {folder1Handle && (
              <div className="folder-path">
                <i className="bi bi-folder me-2"></i>
                {folder1Handle.name}
              </div>
            )}
          </div>
          
          <div className="col-md-6">
            <button
              className="btn btn-primary w-100"
              onClick={() => onFolderSelect(2)}
              disabled={isLoading}
            >
              <i className="bi bi-folder-plus me-2"></i>
              Select Folder 2 (Optional)
            </button>
            {folder2Handle && (
              <div className="folder-path">
                <i className="bi bi-folder me-2"></i>
                {folder2Handle.name}
              </div>
            )}
          </div>
        </div>
        <div className="action-buttons">
          <button
            className="btn btn-success w-100"
            onClick={onFindDuplicates}
            disabled={!folder1Handle || isLoading}
          >
            <i className="bi bi-search me-2"></i>
            Find Duplicates
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={onClear}
            disabled={isLoading || (!folder1Handle && !folder2Handle)}
          >
            <i className="bi bi-x-circle me-2"></i>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderSelection; 