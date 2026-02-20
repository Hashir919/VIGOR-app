import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSettings({ onClose }) {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl transform transition-all scale-100 relative">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-text-main tracking-tight">App Theme</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-highlight transition-colors text-text-muted hover:text-text-main"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {availableThemes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`
                                relative p-4 rounded-2xl border-2 transition-all group overflow-hidden
                                ${theme === t.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent bg-background hover:scale-[1.02]'}
                            `}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <div
                                    className="w-8 h-8 rounded-full shadow-lg"
                                    style={{ backgroundColor: t.color }}
                                ></div>
                                <span className={`font-bold ${theme === t.id ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`}>
                                    {t.name}
                                </span>
                            </div>

                            {/* Active Indicator */}
                            {theme === t.id && (
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-primary">
                                    <span className="material-icons-round">check_circle</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-surface-highlight text-text-main font-bold rounded-xl hover:bg-surface-highlight/80 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
