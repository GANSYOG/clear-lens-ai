
import React, { useRef, useState } from 'react';
import { ProcessingType } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File, type: ProcessingType) => void;
  acceptedType: ProcessingType;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, acceptedType }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (acceptedType === ProcessingType.IMAGE && isImage) {
      onFileSelect(file, ProcessingType.IMAGE);
    } else if (acceptedType === ProcessingType.VIDEO && isVideo) {
      onFileSelect(file, ProcessingType.VIDEO);
    } else {
      alert(`Invalid file type. Please upload a ${acceptedType.toLowerCase()}.`);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300
        flex flex-col items-center justify-center text-center
        ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={acceptedType === ProcessingType.IMAGE ? "image/*" : "video/*"}
        onChange={(e) => {
          if (e.target.files?.[0]) validateAndProcess(e.target.files[0]);
        }}
      />
      
      <div className={`
        w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300
        ${isDragging ? 'scale-110 bg-cyan-500' : 'bg-slate-700 group-hover:bg-slate-600'}
      `}>
        <i className={`fas ${acceptedType === ProcessingType.IMAGE ? 'fa-image' : 'fa-video'} text-3xl text-white`}></i>
      </div>

      <h3 className="text-xl font-semibold mb-2">
        {isDragging ? 'Drop your file here' : `Upload your ${acceptedType.toLowerCase()}`}
      </h3>
      <p className="text-slate-400 max-w-xs">
        Drag and drop or click to browse. Support for JPG, PNG, MP4, and MOV formats.
      </p>
      
      <div className="mt-8 flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <i className="fas fa-shield-halved"></i>
        <span>Privacy guaranteed: Files deleted after processing</span>
      </div>
    </div>
  );
};

export default FileUpload;
