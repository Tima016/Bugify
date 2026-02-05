"use client";

import { useState, useEffect } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import RichTextEditor from './RichTextEditor';
import FileUpload from './FileUpload';
import { Save, AlertCircle } from 'lucide-react';

interface ReportFormData {
    title: string;
    description: string;
    severity: string;
    stepsToReproduce: string;
    impact: string;
    files: File[];
}

export default function ReportForm({ programId }: { programId: string }) {
    const [formData, setFormData] = useState<ReportFormData>({
        title: '',
        description: '',
        severity: 'MEDIUM',
        stepsToReproduce: '',
        impact: '',
        files: [],
    });

    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftNotice, setShowDraftNotice] = useState(false);

    // Auto-save hook
    const { loadSavedData, clearSavedData } = useAutoSave({
        key: `report-draft-${programId}`,
        data: formData,
        delay: 2000,
        onSave: () => {
            setLastSaved(new Date());
        },
    });

    // Load draft on mount
    useEffect(() => {
        const savedDraft = loadSavedData();
        if (savedDraft) {
            setFormData(savedDraft);
            setShowDraftNotice(true);
        }
    }, [loadSavedData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Submit report logic here
        console.log('Submitting report:', formData);

        // Clear draft after successful submission
        clearSavedData();
        setLastSaved(null);
    };

    const handleDiscardDraft = () => {
        clearSavedData();
        setFormData({
            title: '',
            description: '',
            severity: 'MEDIUM',
            stepsToReproduce: '',
            impact: '',
            files: [],
        });
        setShowDraftNotice(false);
        setLastSaved(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Draft Notice */}
            {showDraftNotice && (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-800 dark:text-blue-200">
                            Draft loaded from previous session
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleDiscardDraft}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Discard draft
                    </button>
                </div>
            )}

            {/* Auto-save indicator */}
            {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Save className="w-4 h-4" />
                    <span>
                        Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Title
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    required
                />
            </div>

            {/* Severity */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Severity
                </label>
                <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Description
                </label>
                <RichTextEditor
                    content={formData.description}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                />
            </div>

            {/* Steps to Reproduce */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Steps to Reproduce
                </label>
                <RichTextEditor
                    content={formData.stepsToReproduce}
                    onChange={(content) => setFormData({ ...formData, stepsToReproduce: content })}
                />
            </div>

            {/* Impact */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Impact
                </label>
                <RichTextEditor
                    content={formData.impact}
                    onChange={(content) => setFormData({ ...formData, impact: content })}
                />
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Attachments
                </label>
                <FileUpload
                    onFilesSelected={(files) => setFormData({ ...formData, files })}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
                Submit Report
            </button>
        </form>
    );
}
