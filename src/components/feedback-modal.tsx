'use client';

import * as React from 'react';
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogPanel,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RatingInput from '@/components/RatingInput';
import { CheckCircle, Loader2 } from 'lucide-react';

const GOOGLE_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSeGiPkxVsaX_uyD9bnsPfPzAxvHpTP6NQV31IMQmgbppJswew/formResponse';

const ENTRY_KEYS = {
    email: 'entry.1017002952',
    rating: 'entry.612478784',
    workingWell: 'entry.1740348868',
    frustration: 'entry.1064307831',
} as const;

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userEmail?: string;
}

export function FeedbackModal({ open, onOpenChange, userEmail = '' }: FeedbackModalProps) {
    const [rating, setRating] = React.useState('3');
    const [workingWell, setWorkingWell] = React.useState('');
    const [frustration, setFrustration] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const resetForm = () => {
        setRating('3');
        setWorkingWell('');
        setFrustration('');
        setIsSubmitting(false);
        setIsSubmitted(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            // Reset after close animation
            setTimeout(resetForm, 200);
        }
        onOpenChange(nextOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new URLSearchParams();
            formData.append(ENTRY_KEYS.email, userEmail);
            formData.append(ENTRY_KEYS.rating, rating);
            formData.append(ENTRY_KEYS.workingWell, workingWell);
            formData.append(ENTRY_KEYS.frustration, frustration);

            await fetch(GOOGLE_FORM_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            });

            setIsSubmitted(true);
            // Auto-close after showing success
            setTimeout(() => handleOpenChange(false), 1800);
        } catch {
            // Google Forms with no-cors won't throw on success, but just in case
            setIsSubmitted(true);
            setTimeout(() => handleOpenChange(false), 1800);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogPopup className="sm:max-w-md">
                {isSubmitted ? (
                    <DialogPanel>
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Thank you for your feedback!</p>
                            <p className="text-xs text-muted-foreground">Your response has been recorded.</p>
                        </div>
                    </DialogPanel>
                ) : (
                    <form onSubmit={handleSubmit} className="contents">
                        <DialogHeader>
                            <DialogTitle>Share Your Feedback</DialogTitle>
                            <DialogDescription>
                                Help us improve SaaSFollo. Your feedback goes directly to the team.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogPanel className="grid gap-4 py-4">
                            {/* Email (read-only, prefilled) */}
                            <div className="grid gap-2">
                                <Label htmlFor="feedback-email">Email</Label>
                                <Input
                                    id="feedback-email"
                                    type="email"
                                    value={userEmail}
                                    readOnly
                                    className="bg-muted text-muted-foreground cursor-default"
                                />
                            </div>

                            {/* Rating */}
                            <RatingInput
                                value={rating}
                                onChange={setRating}
                                label="How would you rate your experience?"
                            />

                            {/* What's working well */}
                            <div className="grid gap-2">
                                <Label htmlFor="feedback-working-well">
                                    What&apos;s working well for you so far?
                                </Label>
                                <Textarea
                                    id="feedback-working-well"
                                    placeholder="e.g. The dashboard gives a great overview..."
                                    value={workingWell}
                                    onChange={(e) => setWorkingWell(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Biggest frustration */}
                            <div className="grid gap-2">
                                <Label htmlFor="feedback-frustration">
                                    What&apos;s the biggest frustration or missing piece?
                                </Label>
                                <Textarea
                                    id="feedback-frustration"
                                    placeholder="e.g. I wish I could export tasks as CSV..."
                                    value={frustration}
                                    onChange={(e) => setFrustration(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </DialogPanel>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Feedback'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogPopup>
        </Dialog>
    );
}
