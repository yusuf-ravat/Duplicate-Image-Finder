import React from 'react';

interface PermissionPopupProps {
  onAccept: () => void;
  onDecline: () => void;
}

const PermissionPopup: React.FC<PermissionPopupProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="permission-overlay">
      <div className="permission-popup">
        <div className="permission-content">
          <div className="permission-icon">
            <i className="bi bi-shield-lock"></i>
          </div>
          <h2>Permission Required</h2>
          <div className="permission-message">
            <p className="mb-3">
              To help you find duplicate images, we need permission to access your files. Here's what you should know:
            </p>
            <ul className="permission-list">
              <li>
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                We only access folders that you explicitly select
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                Your files stay on your computer - we never upload them
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                We use local processing - no internet connection needed
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                You can revoke permission anytime from your browser settings
              </li>
            </ul>
            <p className="mt-3 text-muted">
              <i className="bi bi-info-circle me-2"></i>
              This app runs entirely in your browser and respects your privacy
            </p>
          </div>
          <div className="permission-actions">
            <button className="btn btn-primary" onClick={onAccept}>
              <i className="bi bi-check-circle me-2"></i>
              Grant Permission
            </button>
            <button className="btn btn-outline-secondary" onClick={onDecline}>
              <i className="bi bi-x-circle me-2"></i>
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionPopup; 