import React, { useState, useRef, useCallback } from 'react';
import DeleteAlertModal from '../DeleteAlertModal';

// Dosya türleri için ikonlar ve renkler
const FILE_TYPES = {
    pdf: { icon: '📄', color: 'text-red-400', bg: 'bg-red-500/20' },
    doc: { icon: '📝', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    docx: { icon: '📝', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    xls: { icon: '📊', color: 'text-green-400', bg: 'bg-green-500/20' },
    xlsx: { icon: '📊', color: 'text-green-400', bg: 'bg-green-500/20' },
    ppt: { icon: '📽️', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    pptx: { icon: '📽️', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    txt: { icon: '📃', color: 'text-slate-400', bg: 'bg-slate-500/20' },
    zip: { icon: '🗜️', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    rar: { icon: '🗜️', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    png: { icon: '🖼️', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    jpg: { icon: '🖼️', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    jpeg: { icon: '🖼️', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    gif: { icon: '🖼️', color: 'text-pink-400', bg: 'bg-pink-500/20' },
    svg: { icon: '🖼️', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    mp3: { icon: '🎵', color: 'text-teal-400', bg: 'bg-teal-500/20' },
    mp4: { icon: '🎬', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
    default: { icon: '📁', color: 'text-slate-400', bg: 'bg-slate-500/20' }
};

const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return FILE_TYPES[ext] || FILE_TYPES.default;
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileTreeModal = ({ isOpen, onClose, files = [], onAddFiles, onDeleteFile, onOpenFile }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' veya 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, fileId: null, fileName: '' });
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    }, []);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
    };

    const processFiles = async (fileList) => {
        const processedFiles = await Promise.all(
            fileList.map(async (file) => {
                const base64 = await fileToBase64(file);
                return {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    base64: base64,
                    createdAt: new Date().toISOString(),
                };
            })
        );

        if (onAddFiles) {
            onAddFiles(processedFiles);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileClick = (file) => {
        if (onOpenFile) {
            onOpenFile(file);
        }
    };

    const handleDeleteFile = (e, file) => {
        e.stopPropagation();
        setDeleteModal({
            isOpen: true,
            fileId: file.id,
            fileName: file.name
        });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.fileId && onDeleteFile) {
            onDeleteFile(deleteModal.fileId);
        }
        setDeleteModal({ isOpen: false, fileId: null, fileName: '' });
    };

    const toggleSelectFile = (e, fileId) => {
        e.stopPropagation();
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isImageFile = (file) => {
        return file.type && file.type.startsWith('image/');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Dosyalarım</h2>
                            <p className="text-sm text-slate-400">{files.length} dosya</p>
                        </div>
                    </div>

                    {/* View Mode Toggle & Close */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-400 hover:text-white'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-400 hover:text-white'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-700/30">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Dosya ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Dosya Ekle
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg,.gif,.svg,.mp3,.mp4"
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
              relative mb-6 border-2 border-dashed rounded-2xl transition-all duration-300
              ${isDragging
                                ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
                                : 'border-slate-700/50 hover:border-slate-600'
                            }
            `}
                    >
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all
                ${isDragging ? 'bg-primary-500/20 scale-110' : 'bg-slate-800/50'}
              `}>
                                <svg className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-white mb-1">
                                {isDragging ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyip bırakın'}
                            </p>
                            <p className="text-sm text-slate-400">
                                veya <button onClick={() => fileInputRef.current?.click()} className="text-primary-400 hover:text-primary-300 underline">bilgisayarınızdan seçin</button>
                            </p>
                            <p className="text-xs text-slate-500 mt-3">
                                PDF, Word, Excel, PowerPoint, Resimler, Video ve daha fazlası
                            </p>
                        </div>
                    </div>

                    {/* Files Grid/List */}
                    {filteredFiles.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {filteredFiles.map((file) => {
                                    const fileType = getFileType(file.name);
                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => handleFileClick(file)}
                                            className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                                        >
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => handleDeleteFile(e, file)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>

                                            {/* Preview/Icon */}
                                            <div className={`w-full aspect-square rounded-xl ${fileType.bg} flex items-center justify-center mb-3 overflow-hidden`}>
                                                {isImageFile(file) && file.base64 ? (
                                                    <img
                                                        src={file.base64}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-4xl">{fileType.icon}</span>
                                                )}
                                            </div>

                                            {/* File Info */}
                                            <p className="text-sm font-medium text-white truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredFiles.map((file) => {
                                    const fileType = getFileType(file.name);
                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => handleFileClick(file)}
                                            className="group flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
                                        >
                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-xl ${fileType.bg} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                                                {isImageFile(file) && file.base64 ? (
                                                    <img
                                                        src={file.base64}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl">{fileType.icon}</span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <button
                                                onClick={(e) => handleDeleteFile(e, file)}
                                                className="p-2 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">Henüz dosya yok</p>
                            <p className="text-sm mt-1">Dosya eklemek için yukarıdaki alanı kullanın</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            <DeleteAlertModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteConfirm}
                title="Dosyayı Sil"
                message={`"${deleteModal.fileName}" dosyasını silmek istediğinize emin misiniz?`}
            />
        </div>
    );
};

export default FileTreeModal;