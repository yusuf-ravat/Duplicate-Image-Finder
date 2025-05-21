import { useState, useCallback } from 'react';
import { DuplicateImage, FileSystemDirectoryHandle, FileSystemFileHandle } from '../types';

export const useDuplicateFinder = () => {
  const [folder1Handle, setFolder1Handle] = useState<FileSystemDirectoryHandle | null>(null);
  const [folder2Handle, setFolder2Handle] = useState<FileSystemDirectoryHandle | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [imageStatus, setImageStatus] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const handleFolderSelect = useCallback(async (folderNumber: 1 | 2) => {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const permission = await handle.queryPermission({ mode: 'readwrite' });
      
      if (permission !== 'granted') {
        await handle.requestPermission({ mode: 'readwrite' });
      }

      if (folderNumber === 1) {
        setFolder1Handle(handle);
      } else {
        setFolder2Handle(handle);
      }
    } catch (err) {
      console.error(`Error selecting folder ${folderNumber}:`, err);
      alert(`Failed to select Folder ${folderNumber}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const generatePerceptualHash = async (file: File): Promise<string> => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 9;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(img, 0, 0, 9, 8);
    const imageData = ctx.getImageData(0, 0, 9, 8).data;
    let hash = '';

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const index1 = (y * 9 + x) * 4;
        const index2 = (y * 9 + x + 1) * 4;
        const gray1 = (imageData[index1] * 0.299 + imageData[index1 + 1] * 0.587 + imageData[index1 + 2] * 0.114);
        const gray2 = (imageData[index2] * 0.299 + imageData[index2 + 1] * 0.587 + imageData[index2 + 2] * 0.114);
        hash += gray1 > gray2 ? '1' : '0';
      }
    }

    URL.revokeObjectURL(url);
    return hash;
  };

  const calculateSSIM = async (file1: File, file2: File): Promise<number> => {
    const img1 = new Image();
    const img2 = new Image();
    const url1 = URL.createObjectURL(file1);
    const url2 = URL.createObjectURL(file2);

    await Promise.all([
      new Promise((resolve) => { img1.onload = resolve; img1.src = url1; }),
      new Promise((resolve) => { img2.onload = resolve; img2.src = url2; })
    ]);

    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    canvas1.width = canvas2.width = 32;
    canvas1.height = canvas2.height = 32;
    
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    if (!ctx1 || !ctx2) throw new Error('Could not get canvas context');

    ctx1.drawImage(img1, 0, 0, 32, 32);
    ctx2.drawImage(img2, 0, 0, 32, 32);

    const data1 = ctx1.getImageData(0, 0, 32, 32).data;
    const data2 = ctx2.getImageData(0, 0, 32, 32).data;

    let mu1 = 0, mu2 = 0, sigma1 = 0, sigma2 = 0, sigma12 = 0;
    const n = 32 * 32;

    for (let i = 0; i < data1.length; i += 4) {
      const gray1 = (data1[i] * 0.299 + data1[i + 1] * 0.587 + data1[i + 2] * 0.114);
      const gray2 = (data2[i] * 0.299 + data2[i + 1] * 0.587 + data2[i + 2] * 0.114);
      mu1 += gray1;
      mu2 += gray2;
    }
    mu1 /= n;
    mu2 /= n;

    for (let i = 0; i < data1.length; i += 4) {
      const gray1 = (data1[i] * 0.299 + data1[i + 1] * 0.587 + data1[i + 2] * 0.114);
      const gray2 = (data2[i] * 0.299 + data2[i + 1] * 0.587 + data2[i + 2] * 0.114);
      sigma1 += (gray1 - mu1) ** 2;
      sigma2 += (gray2 - mu2) ** 2;
      sigma12 += (gray1 - mu1) * (gray2 - mu2);
    }
    sigma1 = Math.sqrt(sigma1 / n);
    sigma2 = Math.sqrt(sigma2 / n);
    sigma12 /= n;

    const C1 = (0.01 * 255) ** 2;
    const C2 = (0.03 * 255) ** 2;

    const ssim = ((2 * mu1 * mu2 + C1) * (2 * sigma12 + C2)) /
                 ((mu1 ** 2 + mu2 ** 2 + C1) * (sigma1 ** 2 + sigma2 ** 2 + C2));

    URL.revokeObjectURL(url1);
    URL.revokeObjectURL(url2);
    return ssim;
  };

  const hammingDistance = (hash1: string, hash2: string): number => {
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) {
        distance++;
      }
    }
    return distance;
  };

  const handleFindDuplicates = useCallback(async () => {
    if (!folder1Handle) {
      alert('Please select at least Folder 1.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setDuplicates([]);
    const imageHashes = new Map<string, { fileHandle: FileSystemFileHandle; folder: string; name: string; file: File }>();

    const processFolder = async (
      folderHandle: FileSystemDirectoryHandle,
      folderName: string,
      imageHashes: Map<string, { fileHandle: FileSystemFileHandle; folder: string; name: string; file: File }>
    ) => {
      let totalFiles = 0;
      let processedFiles = 0;

      for await (const entry of folderHandle.values()) {
        if (entry.kind === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(entry.name)) {
          totalFiles++;
        }
      }

      for await (const entry of folderHandle.values()) {
        if (entry.kind === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(entry.name)) {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const imageUrl = URL.createObjectURL(file);
          
          setCurrentFile(entry.name);
          setCurrentImageUrl(imageUrl);
          setProgress(Math.round((processedFiles / totalFiles) * 100));
          setImageStatus('Analyzing image...');

          const hash = await generatePerceptualHash(file);
          let isDuplicate = false;

          for (const [existingHash, existingImage] of Array.from(imageHashes.entries())) {
            const distance = hammingDistance(hash, existingHash);
            const similarity = 1 - (distance / hash.length);

            if (similarity > 0.90) {
              const ssim = await calculateSSIM(file, existingImage.file);
              if (ssim > 0.95) {
                setDuplicates(prev => [...prev, {
                  original: existingImage,
                  duplicate: { fileHandle, folder: folderName, name: entry.name, file },
                  similarity: Math.round(ssim * 100)
                }]);
                isDuplicate = true;
                setImageStatus('Duplicate found!');
                break;
              }
            }
          }

          if (!isDuplicate) {
            imageHashes.set(hash, { fileHandle, folder: folderName, name: entry.name, file });
            setImageStatus('No duplicates found');
          }

          processedFiles++;
          URL.revokeObjectURL(imageUrl);
        }
      }
    };

    try {
      setImageStatus('Initializing...');
      
      // Process folders
      await processFolder(folder1Handle, 'Folder 1', imageHashes);
      if (folder2Handle) {
        await processFolder(folder2Handle, 'Folder 2', imageHashes);
      }

      setProgress(100);
      setImageStatus('All images processed');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error finding duplicates:', err);
      alert(`Error finding duplicates: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [folder1Handle, folder2Handle]);

  const handleDeleteDuplicate = useCallback(async (duplicate: DuplicateImage) => {
    if (window.confirm(`Delete ${duplicate.duplicate.name} from ${duplicate.duplicate.folder}?`)) {
      try {
        const permission = await duplicate.duplicate.fileHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          await duplicate.duplicate.fileHandle.requestPermission({ mode: 'readwrite' });
        }
        await duplicate.duplicate.fileHandle.remove();
        setDuplicates(prev => prev.filter(d => d !== duplicate));
      } catch (err) {
        console.error('Error deleting file:', err);
        alert(`Failed to delete file: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    setFolder1Handle(null);
    setFolder2Handle(null);
    setDuplicates([]);
    setProgress(0);
    setCurrentFile('');
    setImageStatus('');
    setCurrentImageUrl('');
  }, []);

  return {
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
  };
}; 