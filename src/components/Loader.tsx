import React from 'react';

interface LoaderProps {
  progress: number;
  currentFile: string;
  status: string;
  imageUrl?: string;
}

const Loader: React.FC<LoaderProps> = ({ progress, currentFile, status, imageUrl }) => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="scan-grid"></div>
        <div className="image-container">
          {imageUrl && (
            <img
              className="preview-image"
              src={imageUrl}
              alt={currentFile}
            />
          )}
        </div>
        <div className="scan-line"></div>
        <div className="scan-corners"></div>
        <div className="image-info">
          <div className="image-name">{currentFile}</div>
          <div className="image-status">{status}</div>
        </div>
        <div className="loader-percentage">{progress}%</div>
      </div>
    </div>
  );
};

export default Loader; 