"use client";

import { useState } from 'react';

interface CVSSVector {
    attackVector: 'N' | 'A' | 'L' | 'P';
    attackComplexity: 'L' | 'H';
    privilegesRequired: 'N' | 'L' | 'H';
    userInteraction: 'N' | 'R';
    scope: 'U' | 'C';
    confidentiality: 'N' | 'L' | 'H';
    integrity: 'N' | 'L' | 'H';
    availability: 'N' | 'L' | 'H';
}

export default function CVSSCalculator() {
    const [vector, setVector] = useState<CVSSVector>({
        attackVector: 'N',
        attackComplexity: 'L',
        privilegesRequired: 'N',
        userInteraction: 'N',
        scope: 'U',
        confidentiality: 'N',
        integrity: 'N',
        availability: 'N',
    });

    const [score, setScore] = useState<number>(0);
    const [severity, setSeverity] = useState<string>('NONE');

    const calculateScore = async () => {
        // Call backend API to calculate score
        const response = await fetch('/api/cvss/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vector),
        });

        const result = await response.json();
        setScore(result.baseScore);
        setSeverity(result.severity);
    };

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'CRITICAL': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
            case 'HIGH': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            case 'LOW': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">CVSS v3.1 Calculator</h2>

            {/* Score Display */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{score.toFixed(1)}</div>
                    <div className={`inline-block px-4 py-2 rounded-full font-medium ${getSeverityColor(severity)}`}>
                        {severity}
                    </div>
                </div>
            </div>

            {/* Attack Vector */}
            <div>
                <label className="block text-sm font-medium mb-2">Attack Vector (AV)</label>
                <select
                    value={vector.attackVector}
                    onChange={(e) => setVector({ ...vector, attackVector: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                >
                    <option value="N">Network (N)</option>
                    <option value="A">Adjacent (A)</option>
                    <option value="L">Local (L)</option>
                    <option value="P">Physical (P)</option>
                </select>
            </div>

            {/* Attack Complexity */}
            <div>
                <label className="block text-sm font-medium mb-2">Attack Complexity (AC)</label>
                <select
                    value={vector.attackComplexity}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setVector({ ...vector, attackComplexity: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                >
                    <option value="L">Low (L)</option>
                    <option value="H">High (H)</option>
                </select>
            </div>

            {/* Privileges Required */}
            <div>
                <label className="block text-sm font-medium mb-2">Privileges Required (PR)</label>
                <select
                    value={vector.privilegesRequired}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setVector({ ...vector, privilegesRequired: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                >
                    <option value="N">None (N)</option>
                    <option value="L">Low (L)</option>
                    <option value="H">High (H)</option>
                </select>
            </div>

            {/* User Interaction */}
            <div>
                <label className="block text-sm font-medium mb-2">User Interaction (UI)</label>
                <select
                    value={vector.userInteraction}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setVector({ ...vector, userInteraction: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                >
                    <option value="N">None (N)</option>
                    <option value="R">Required (R)</option>
                </select>
            </div>

            {/* Scope */}
            <div>
                <label className="block text-sm font-medium mb-2">Scope (S)</label>
                <select
                    value={vector.scope}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setVector({ ...vector, scope: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                >
                    <option value="U">Unchanged (U)</option>
                    <option value="C">Changed (C)</option>
                </select>
            </div>

            {/* CIA Triad */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Confidentiality (C)</label>
                    <select
                        value={vector.confidentiality}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setVector({ ...vector, confidentiality: e.target.value as any })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                    >
                        <option value="N">None</option>
                        <option value="L">Low</option>
                        <option value="H">High</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Integrity (I)</label>
                    <select
                        value={vector.integrity}
                        onChange={(e) => setVector({ ...vector, integrity: e.target.value as any })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                    >
                        <option value="N">None</option>
                        <option value="L">Low</option>
                        <option value="H">High</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Availability (A)</label>
                    <select
                        value={vector.availability}
                        onChange={(e) => setVector({ ...vector, availability: e.target.value as any })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                    >
                        <option value="N">None</option>
                        <option value="L">Low</option>
                        <option value="H">High</option>
                    </select>
                </div>
            </div>

            {/* Calculate Button */}
            <button
                onClick={calculateScore}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
                Calculate Score
            </button>
        </div>
    );
}
