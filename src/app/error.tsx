'use client'; // Error components must be Client Components

import { useEffect, useState } from 'react';
import { AlertTriangle, Copy, Check, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function GlobalErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [copied, setCopied] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled frontend error:', error);
    }, [error]);

    const copyToClipboard = () => {
        const errorLog = `
Error: ${error.message}
Digest: ${error.digest || 'N/A'}
Stack: ${error.stack || 'No stack trace available'}
Url: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
Time: ${new Date().toISOString()}
    `.trim();

        navigator.clipboard.writeText(errorLog).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="max-w-3xl w-full border-destructive/20 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center gap-3 text-destructive">
                        <div className="p-2.5 bg-destructive/10 rounded-xl">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Application Error</CardTitle>
                    </div>
                    <CardDescription className="text-base text-muted-foreground pt-1">
                        An unexpected error occurred in the client application. We apologize for the inconvenience.
                        Please share the error details below with the support team to help us fix this issue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                    <div className="bg-muted/40 rounded-xl border p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">Error Message</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="h-8">
                                {showDetails ? (
                                    <><ChevronUp className="h-4 w-4 mr-1" /> Hide Stack Trace</>
                                ) : (
                                    <><ChevronDown className="h-4 w-4 mr-1" /> Show Stack Trace</>
                                )}
                            </Button>
                        </div>
                        <p className="text-sm font-medium font-mono text-destructive bg-destructive/10 inline-block px-3 py-1.5 rounded-md">
                            {error.message || 'Unknown Error'}
                        </p>

                        {showDetails && (
                            <div className="mt-5 pt-5 border-t border-border/60 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm">Diagnostic Information</h3>
                                    <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8 group">
                                        {copied ? (
                                            <><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Copied!</>
                                        ) : (
                                            <><Copy className="h-3.5 w-3.5 mr-2 group-hover:text-primary transition-colors" /> Copy Error Log</>
                                        )}
                                    </Button>
                                </div>
                                <div className="bg-[#0D1117] dark:bg-black rounded-lg p-4 overflow-x-auto border border-border/20 shadow-inner">
                                    <pre className="text-[13px] text-[#A5D6FF] font-mono leading-relaxed whitespace-pre-wrap">
                                        <span className="text-[#FF7B72]">Message:</span> {error.message}
                                        {'\n'}
                                        <span className="text-[#79C0FF]">Digest:</span>  {error.digest || 'N/A'}
                                        {'\n'}
                                        <span className="text-[#79C0FF]">URL:</span>     {typeof window !== 'undefined' ? window.location.href : 'SSR'}
                                        {'\n'}
                                        <span className="text-[#79C0FF]">Agent:</span>   {typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'}
                                        {'\n\n'}
                                        <span className="text-muted-foreground">--- Stack Trace ---</span>
                                        {'\n'}
                                        <span className="text-[#D2A8FF]">{error.stack || 'No stack trace available'}</span>
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex items-center gap-3 justify-end border-t bg-muted/10 p-5 rounded-b-xl">
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <Home className="h-4 w-4" /> Return Home
                        </Button>
                    </Link>
                    <Button onClick={() => reset()} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Try Again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
