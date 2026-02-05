"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image as ImageIcon, FileText } from 'lucide-react';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
    acceptedFileTypes?: string[];
    multiple?: boolean;
}

export default function FileUpload({
    onFilesSelected,
    maxFiles = 5,
    maxSize = 52428800, // 50MB
    acceptedFileTypes = ['image/*', 'application/pdf', 'text/plain', 'application/zip'],
    multiple = true,
}: FileUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);
        onFilesSelected(acceptedFiles);
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize,
        accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
        multiple,
    });

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon className="w-6 h-6 text-blue-500" />;
        } else if (file.type === 'application/pdf') {
            return <FileText className="w-6 h-6 text-red-500" />;
        }
        return <File className="w-6 h-6 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                        Drop files here...
                    </p>
                ) : (
                    <div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Drag & drop files here, or click to select
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Max {maxFiles} files, up to {formatFileSize(maxSize)} each
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Supported: Images, PDF, Text, ZIP
                        </p>
                    </div>
                )}
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploaded Files ({uploadedFiles.length})
                    </h4>
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(file)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Remove file"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
