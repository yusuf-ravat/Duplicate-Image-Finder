import React from 'react';
import { DuplicateImage } from '../types';

interface ResultsProps {
  duplicates: DuplicateImage[];
  onDelete: (duplicate: DuplicateImage) => Promise<void>;
  folder2Handle: FileSystemDirectoryHandle | null;
  isLoading: boolean;
  hasSearched: boolean;
}

const Results: React.FC<ResultsProps> = ({ duplicates, onDelete, folder2Handle, isLoading, hasSearched }) => {
  if (!isLoading && hasSearched && duplicates.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="no-duplicates">
            <i className="bi bi-check-circle-fill"></i>
            <p>
              {folder2Handle 
                ? "No duplicate images found between the selected folders"
                : "No duplicate images found in the selected folder"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="card-title mb-0">
            <i className="bi bi-images"></i>
            {folder2Handle ? "Duplicate Images Between Folders" : "Duplicate Images in Folder"}
          </h2>
          <span className="badge bg-primary">
            <i className="bi bi-files me-1"></i>
            {duplicates.length} duplicates
          </span>
        </div>
        <div className="results-container">
          <div className="duplicate-list">
            {duplicates.map((dup, index) => (
              <div key={index} className="duplicate-item">
                <div className="duplicate-images">
                  <div className="duplicate-image">
                    <img
                      src={URL.createObjectURL(dup.original.file)}
                      alt={dup.original.name}
                    />
                  </div>
                  <i className="bi bi-arrow-right text-muted"></i>
                  <div className="duplicate-image">
                    <img
                      src={URL.createObjectURL(dup.duplicate.file)}
                      alt={dup.duplicate.name}
                    />
                  </div>
                </div>
                <div className="duplicate-info">
                  <div className="duplicate-name">{dup.duplicate.name}</div>
                  <div className="duplicate-folder">{dup.duplicate.folder}</div>
                  <span className="duplicate-similarity">
                    {dup.similarity}% similar
                  </span>
                </div>
                <div className="duplicate-actions">
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(dup)}
                    title="Delete duplicate"
                  >
                    <i className="bi bi-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results; 