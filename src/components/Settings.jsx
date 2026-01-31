import React, { useState, useEffect } from 'react';

const Settings = ({ currentTheme, onThemeChange }) => {
    const themes = [
        {
            id: 'dark',
            name: 'Koyu Tema',
            colors: {
                bg: 'from-slate-900 via-slate-800 to-slate-900',
                preview: ['#0f172a', '#1e293b', '#334155']
            }
        },
        {
            id: 'midnight',
            name: 'Gece Mavisi',
            colors: {
                bg: 'from-slate-950 via-indigo-950 to-slate-950',
                preview: ['#020617', '#1e1b4b', '#0f172a']
            }
        },
        {
            id: 'ocean',
            name: 'Okyanus',
            colors: {
                bg: 'from-slate-900 via-cyan-950 to-slate-900',
                preview: ['#0f172a', '#083344', '#0f172a']
            }
        },
        {
            id: 'forest',
            name: 'Orman',
            colors: {
                bg: 'from-slate-900 via-emerald-950 to-slate-900',
                preview: ['#0f172a', '#022c22', '#0f172a']
            }
        },
        {
            id: 'sunset',
            name: 'Gün Batımı',
            colors: {
                bg: 'from-slate-900 via-rose-950 to-slate-900',
                preview: ['#0f172a', '#4c0519', '#0f172a']
            }
        },
        {
            id: 'purple',
            name: 'Mor Rüya',
            colors: {
                bg: 'from-slate-900 via-purple-950 to-slate-900',
                preview: ['#0f172a', '#3b0764', '#0f172a']
            }
        },
    ];

    const accentColors = [
        { id: 'indigo', name: 'İndigo', color: '#6366f1', class: 'bg-indigo-500' },
        { id: 'blue', name: 'Mavi', color: '#3b82f6', class: 'bg-blue-500' },
        { id: 'cyan', name: 'Camgöbeği', color: '#06b6d4', class: 'bg-cyan-500' },
        { id: 'emerald', name: 'Zümrüt', color: '#10b981', class: 'bg-emerald-500' },
        { id: 'amber', name: 'Kehribar', color: '#f59e0b', class: 'bg-amber-500' },
        { id: 'rose', name: 'Gül', color: '#f43f5e', class: 'bg-rose-500' },
        { id: 'purple', name: 'Mor', color: '#a855f7', class: 'bg-purple-500' },
        { id: 'pink', name: 'Pembe', color: '#ec4899', class: 'bg-pink-500' },
    ];

    const [selectedTheme, setSelectedTheme] = useState(currentTheme?.theme || 'dark');
    const [selectedAccent, setSelectedAccent] = useState(currentTheme?.accent || 'indigo');

    const handleThemeSelect = (themeId) => {
        setSelectedTheme(themeId);
        onThemeChange({ theme: themeId, accent: selectedAccent });
    };

    const handleAccentSelect = (accentId) => {
        setSelectedAccent(accentId);
        onThemeChange({ theme: selectedTheme, accent: accentId });
    };

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Ayarlar</h1>
                    <p className="text-slate-400">Uygulamanızı kişiselleştirin</p>
                </div>

                {/* Theme Selection */}
                <div className="settings-section">
                    <h2 className="settings-section-title">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Tema
                    </h2>
                    <p className="settings-section-desc">Arka plan temasını seçin</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeSelect(theme.id)}
                                className={`theme-card ${selectedTheme === theme.id ? 'theme-card-active' : ''}`}
                            >
                                <div className="theme-preview">
                                    {theme.colors.preview.map((color, i) => (
                                        <div
                                            key={i}
                                            className="theme-preview-segment"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span className="theme-card-name">{theme.name}</span>
                                {selectedTheme === theme.id && (
                                    <div className="theme-card-check">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent Color */}
                <div className="settings-section">
                    <h2 className="settings-section-title">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-5.657l-.707.707M7.05 16.95l-.707.707m0-10.607l.707.707m9.9 9.9l.707.707" />
                        </svg>
                        Vurgu Rengi
                    </h2>
                    <p className="settings-section-desc">Butonlar ve aktif elementler için renk seçin</p>

                    <div className="flex flex-wrap gap-3 mt-4">
                        {accentColors.map((accent) => (
                            <button
                                key={accent.id}
                                onClick={() => handleAccentSelect(accent.id)}
                                className={`accent-color-btn ${selectedAccent === accent.id ? 'accent-color-btn-active' : ''}`}
                                title={accent.name}
                            >
                                <div
                                    className="w-8 h-8 rounded-full"
                                    style={{ backgroundColor: accent.color }}
                                />
                                {selectedAccent === accent.id && (
                                    <div className="accent-check">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* App Info */}
                <div className="settings-section">
                    <h2 className="settings-section-title">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Uygulama Hakkında
                    </h2>

                    <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <span className="text-slate-400">Versiyon</span>
                            <span className="text-white font-medium">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <span className="text-slate-400">Geliştirici</span>
                            <span className="text-white font-medium">Kanban App</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-400">Electron</span>
                            <span className="text-white font-medium">v28.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
