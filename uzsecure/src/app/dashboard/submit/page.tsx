'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, Upload, X } from 'lucide-react';
import { Program } from '@/types';

// Validation Schema
const reportSchema = z.object({
    programId: z.string().min(1, 'Please select a program'),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    vulnerabilityType: z.string().min(1, 'Please select a vulnerability type'),
    severity: z.string().min(1, 'Please select a severity'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    impact: z.string().min(20, 'Impact must be at least 20 characters'),
    reproductionSteps: z.string().min(20, 'Reproduction steps must be at least 20 characters'),
});

type ReportFormData = z.infer<typeof reportSchema>;

const STEPS = [
    { id: 1, name: 'Program' },
    { id: 2, name: 'Vulnerability' },
    { id: 3, name: 'Details' },
    { id: 4, name: 'Proof of Concept' },
    { id: 5, name: 'Review' },
];

function SubmitReportContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const programId = searchParams.get('program');

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<ReportFormData>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            programId: programId || '',
            severity: 'MEDIUM',
        },
    });

    const formData = watch();

    useEffect(() => {
        const fetchPrograms = async () => {
            setLoadingPrograms(true);
            try {
                const data = await api.programs.getAll();
                setPrograms(data);

                if (programId) {
                    const program = data.find(p => p.id === programId);
                    if (program) {
                        setSelectedProgram(program);
                        setCurrentStep(2); // Skip to step 2 if program is pre-selected
                    }
                }
            } catch (error) {
                console.error('Failed to fetch programs:', error);
            } finally {
                setLoadingPrograms(false);
            }
        };

        fetchPrograms();
    }, [programId]);

    const handleProgramSelect = (program: Program) => {
        setSelectedProgram(program);
        setValue('programId', program.id);
    };

    const handleNext = async () => {
        let isValid = false;

        if (currentStep === 1) {
            isValid = await trigger('programId');
        } else if (currentStep === 2) {
            isValid = await trigger(['title', 'vulnerabilityType', 'severity']);
        } else if (currentStep === 3) {
            isValid = await trigger(['description', 'impact', 'reproductionSteps']);
        } else {
            isValid = true;
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async () => {
        setSubmitting(true);
        try {
            // In a real app, you would upload files first and get URLs
            // For this demo, we'll just submit the text data

            const reportData = {
                ...formData,
                status: 'NEW',
                // attachments: files.map(f => f.name), // Mock attachment handling
            };

            await api.reports.create(reportData);
            router.push('/dashboard/reports');
        } catch (error) {
            console.error('Failed to submit report:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Progress Steps */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -z-10" />
                <div className="flex justify-between">
                    {STEPS.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${isCompleted
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : isCurrent
                                            ? 'border-primary text-primary'
                                            : 'border-muted-foreground text-muted-foreground'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <span>{step.id}</span>}
                                </div>
                                <span
                                    className={`text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    {step.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submit Vulnerability Report</CardTitle>
                    <CardDescription>
                        Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1: Program Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    placeholder="Search programs..."
                                    className="mb-4"
                                    onChange={(e) => {
                                        // Implement client-side filtering if needed
                                    }}
                                />
                            </div>
                            <div className="grid gap-4 max-h-[400px] overflow-y-auto">
                                {loadingPrograms ? (
                                    <div className="text-center py-4">Loading programs...</div>
                                ) : (
                                    programs.map((program) => (
                                        <div
                                            key={program.id}
                                            onClick={() => handleProgramSelect(program)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedProgram?.id === program.id
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:bg-accent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {program.company?.logo && (
                                                    <img
                                                        src={program.company.logo}
                                                        alt={program.company.companyName}
                                                        className="h-10 w-10 rounded-md object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <h4 className="font-semibold">{program.programName}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {program.company?.companyName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {errors.programId && (
                                <p className="text-sm text-red-500">{errors.programId.message}</p>
                            )}
                        </div>
                    )}

                    {/* Step 2: Vulnerability Details */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vulnerability Title</label>
                                <Input
                                    {...register('title')}
                                    placeholder="e.g., Stored XSS in User Profile"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vulnerability Type</label>
                                <select
                                    {...register('vulnerabilityType')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select a type...</option>
                                    <option value="XSS">Cross-Site Scripting (XSS)</option>
                                    <option value="SQLI">SQL Injection</option>
                                    <option value="RCE">Remote Code Execution</option>
                                    <option value="IDOR">Insecure Direct Object Reference</option>
                                    <option value="CSRF">Cross-Site Request Forgery</option>
                                    <option value="AUTH">Authentication Bypass</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                {errors.vulnerabilityType && (
                                    <p className="text-sm text-red-500">{errors.vulnerabilityType.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Severity</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((severity) => (
                                        <label
                                            key={severity}
                                            className={`flex items-center justify-center p-3 rounded-md border cursor-pointer hover:bg-accent ${formData.severity === severity
                                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                                : ''
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value={severity}
                                                {...register('severity')}
                                                className="sr-only"
                                            />
                                            {severity}
                                        </label>
                                    ))}
                                </div>
                                {errors.severity && (
                                    <p className="text-sm text-red-500">{errors.severity.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Technical Details */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    {...register('description')}
                                    placeholder="Detailed description of the vulnerability..."
                                    className="min-h-[150px]"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Impact</label>
                                <Textarea
                                    {...register('impact')}
                                    placeholder="What is the security impact of this vulnerability?"
                                    className="min-h-[100px]"
                                />
                                {errors.impact && (
                                    <p className="text-sm text-red-500">{errors.impact.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reproduction Steps</label>
                                <Textarea
                                    {...register('reproductionSteps')}
                                    placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                                    className="min-h-[150px]"
                                />
                                {errors.reproductionSteps && (
                                    <p className="text-sm text-red-500">{errors.reproductionSteps.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Proof of Concept */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:bg-accent/50 transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">Drop files here or click to upload</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Images, PDFs, or video proof (max 50MB)
                                    </p>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Attached Files</h4>
                                    <div className="grid gap-2">
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-secondary rounded-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-background rounded flex items-center justify-center">
                                                        <span className="text-xs font-bold uppercase">
                                                            {file.name.split('.').pop()}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFile(index)}
                                                    className="text-destructive hover:text-destructive/90"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <div className="flex items-center gap-3 mb-4">
                                    {selectedProgram?.company?.logo && (
                                        <img
                                            src={selectedProgram.company.logo}
                                            alt={selectedProgram.company.companyName}
                                            className="h-10 w-10 rounded-md object-cover"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-semibold">{selectedProgram?.programName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedProgram?.company?.companyName}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Title</span>
                                        <p className="font-medium">{formData.title}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Type</span>
                                        <p className="font-medium">{formData.vulnerabilityType}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Severity</span>
                                        <Badge variant="outline">{formData.severity}</Badge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Attachments</span>
                                        <p className="font-medium">{files.length} files</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <div className="p-3 rounded-md bg-secondary text-sm">
                                    {formData.description}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                <p>
                                    By submitting this report, you agree to the program's policy and terms of service.
                                    Your report will be reviewed by the security team.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1 || submitting}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button onClick={handleNext}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={onSubmit} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default function SubmitReportPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <SubmitReportContent />
        </Suspense>
    );
}
