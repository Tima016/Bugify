"use client";

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { debounce } from 'lodash';



export function useAutoSave<T>({ key, data, delay = 2000, onSave }: { key: string; data: T; delay?: number; onSave?: (data: T) => void }) {
    const isFirstRender = useRef(true);

    // Debounced save function
    const debouncedSave = useMemo(
        () =>
            debounce((dataToSave: T) => {
                try {
                    // Save to localStorage
                    localStorage.setItem(key, JSON.stringify(dataToSave));

                    // Call optional callback
                    if (onSave) {
                        onSave(dataToSave);
                    }
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }, delay),
        [key, delay, onSave]
    );

    // Auto-save when data changes
    useEffect(() => {
        // Skip first render to avoid saving initial empty state
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (data) {
            debouncedSave(data);
        }

        // Cleanup
        return () => {
            debouncedSave.cancel();
        };
    }, [data, debouncedSave]);

    // Load saved data
    const loadSavedData = useCallback((): T | null => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load saved data:', error);
            return null;
        }
    }, [key]);

    // Clear saved data
    const clearSavedData = useCallback(() => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to clear saved data:', error);
        }
    }, [key]);

    return {
        loadSavedData,
        clearSavedData,
    };
}
