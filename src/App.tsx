import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import FolderSelection from './components/FolderSelection';
import Loader from './components/Loader';
import Results from './components/Results';
import PermissionPopup from './components/PermissionPopup';
import { useDuplicateFinder } from './hooks/useDuplicateFinder';

function App() {
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const {
    folder1Handle,
    folder2Handle,
    duplicates,
    isLoading,
    progress,
    currentFile,
    imageStatus,
    currentImageUrl,
    handleFolderSelect,
    handleFindDuplicates,
    handleDeleteDuplicate,
    handleClear
  } = useDuplicateFinder();

  const handleSearch = async () => {
    await handleFindDuplicates();
    setHasSearched(true);
  };

  const handleClearAll = () => {
    handleClear();
    setHasSearched(false);
  };

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowPermissionPopup(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleAcceptPermission = () => {
    setShowPermissionPopup(false);
  };

  const handleDeclinePermission = () => {
    setShowPermissionPopup(false);
    // You might want to show a message that the app won't work without permission
    alert('This app requires permission to access files to find duplicate images.');
  };

  return (
    <div className="container py-4">
      {/* Permission Popup */}
      {showPermissionPopup && (
        <PermissionPopup
          onAccept={handleAcceptPermission}
          onDecline={handleDeclinePermission}
        />
      )}

      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">
          <img src="/favicon.png" alt="Logo" className="app-logo me-2" />
          Duplicate Image Finder
        </h1>
        <p className="app-subtitle">Find and remove duplicate images from your folders</p>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Folder Selection */}
        <FolderSelection
          folder1Handle={folder1Handle}
          folder2Handle={folder2Handle}
          onFolderSelect={handleFolderSelect}
          onFindDuplicates={handleSearch}
          onClear={handleClearAll}
          isLoading={isLoading}
        />

        {/* Loader */}
        {isLoading && (
          <Loader
            progress={progress}
            currentFile={currentFile}
            status={imageStatus}
            imageUrl={currentImageUrl}
          />
        )}

        {/* Results */}
        {!isLoading && (
          <Results
            duplicates={duplicates}
            onDelete={handleDeleteDuplicate}
            folder2Handle={folder2Handle}
            isLoading={isLoading}
            hasSearched={hasSearched}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>© 2025 Duplicate Image Finder</span>
          <span className="footer-divider">•</span>
          <a 
            href="https://github.com/yourusername/duplicate-image-finder" 
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-github me-1"></i>
            GitHub
          </a>
          <span className="footer-divider">•</span>
          <button 
            className="footer-link"
            onClick={() => window.open('https://github.com/yourusername/duplicate-image-finder/wiki', '_blank')}
          >
            <i className="bi bi-question-circle me-1"></i>
            Help
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
