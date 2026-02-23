'use client';

import { useState } from 'react';
import { Lock, Plus, Eye, EyeOff, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { createSecret, deleteSecret, revealSecret, setupPin, hasPinSetup } from '@/lib/actions/secrets';
import type { Secret } from '@/lib/types/database';

interface SecretsClientProps {
    initialSecrets: Secret[];
    projectId: string;
    hasPinInitially: boolean;
}

export function SecretsClient({ initialSecrets, projectId, hasPinInitially }: SecretsClientProps) {
    const [secrets, setSecrets] = useState<Secret[]>(initialSecrets);
    const [hasPin, setHasPin] = useState(hasPinInitially);
    const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});

    // PIN setup
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(!hasPinInitially);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState<string | null>(null);
    const [isSettingPin, setIsSettingPin] = useState(false);

    // Add secret
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [addError, setAddError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Reveal
    const [revealPin, setRevealPin] = useState('');
    const [revealSecretId, setRevealSecretId] = useState<string | null>(null);
    const [revealError, setRevealError] = useState<string | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);

    const handleSetupPin = async () => {
        if (pin.length !== 6 || !/^\d+$/.test(pin)) {
            setPinError('PIN must be exactly 6 digits');
            return;
        }
        if (pin !== confirmPin) {
            setPinError('PINs do not match');
            return;
        }

        setIsSettingPin(true);
        setPinError(null);

        try {
            await setupPin(pin);
            setHasPin(true);
            setIsPinDialogOpen(false);
            setPin('');
            setConfirmPin('');
        } catch (err) {
            console.error('Failed to set PIN:', err);
            setPinError('Failed to set PIN');
        } finally {
            setIsSettingPin(false);
        }
    };

    const handleAddSecret = async () => {
        if (!newKey.trim()) {
            setAddError('Key is required');
            return;
        }
        if (!newValue.trim()) {
            setAddError('Value is required');
            return;
        }

        setIsAdding(true);
        setAddError(null);

        try {
            const secret = await createSecret(projectId, {
                key: newKey.trim(),
                encrypted_value: newValue.trim(),
            });
            setSecrets((prev) => [secret, ...prev]);
            setIsAddDialogOpen(false);
            setNewKey('');
            setNewValue('');
        } catch (err) {
            console.error('Failed to add secret:', err);
            setAddError('Failed to add secret');
        } finally {
            setIsAdding(false);
        }
    };

    const handleReveal = async () => {
        if (!revealSecretId) return;
        if (revealPin.length !== 6) {
            setRevealError('Enter your 6-digit PIN');
            return;
        }

        setIsRevealing(true);
        setRevealError(null);

        try {
            const value = await revealSecret(revealSecretId, revealPin);
            setRevealedSecrets((prev) => ({ ...prev, [revealSecretId]: value }));
            setRevealSecretId(null);
            setRevealPin('');
        } catch (err) {
            console.error('Failed to reveal secret:', err);
            setRevealError('Invalid PIN');
        } finally {
            setIsRevealing(false);
        }
    };

    const handleDelete = async (secretNanoid: string) => {
        if (!confirm('Are you sure you want to delete this secret?')) return;
        try {
            await deleteSecret(secretNanoid, projectId);
            setSecrets((prev) => prev.filter((s) => s.nanoid !== secretNanoid));
            setRevealedSecrets((prev) => {
                const copy = { ...prev };
                delete copy[secretNanoid];
                return copy;
            });
        } catch (err) {
            console.error('Failed to delete secret:', err);
        }
    };

    const hideSecret = (secretNanoid: string) => {
        setRevealedSecrets((prev) => {
            const copy = { ...prev };
            delete copy[secretNanoid];
            return copy;
        });
    };

    // PIN Setup Dialog (shown if no PIN)
    if (!hasPin) {
        return (
            <div className="p-6">
                <AlertDialog open={isPinDialogOpen} onOpenChange={() => { }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5" />
                                Set Up Your Secrets PIN
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Create a 6-digit PIN to protect your secrets. You&apos;ll need this PIN to reveal any secret values.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Enter 6-digit PIN</Label>
                                <Input
                                    type="password"
                                    maxLength={6}
                                    placeholder="••••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm PIN</Label>
                                <Input
                                    type="password"
                                    maxLength={6}
                                    placeholder="••••••"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>
                            {pinError && <p className="text-sm text-destructive">{pinError}</p>}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={handleSetupPin} disabled={isSettingPin}>
                                {isSettingPin ? 'Setting up...' : 'Set PIN'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Secrets</h1>
                        <p className="text-sm text-muted-foreground">
                            Securely store API keys and credentials
                        </p>
                    </div>
                </div>

                <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <AlertDialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Add Secret</Button>} />
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Add New Secret</AlertDialogTitle>
                            <AlertDialogDescription>
                                Store a key-value pair securely
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Key (e.g., API_KEY)</Label>
                                <Input
                                    placeholder="STRIPE_SECRET_KEY"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    disabled={isAdding}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input
                                    type="password"
                                    placeholder="sk_live_..."
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    disabled={isAdding}
                                />
                            </div>
                            {addError && <p className="text-sm text-destructive">{addError}</p>}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isAdding}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAddSecret} disabled={isAdding}>
                                {isAdding ? 'Adding...' : 'Add Secret'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Reveal PIN Dialog */}
            <AlertDialog open={revealSecretId !== null} onOpenChange={(open) => !open && setRevealSecretId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            Enter PIN to Reveal
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter your 6-digit PIN to reveal this secret
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            type="password"
                            maxLength={6}
                            placeholder="••••••"
                            value={revealPin}
                            onChange={(e) => setRevealPin(e.target.value.replace(/\D/g, ''))}
                            className="text-center text-2xl tracking-widest"
                        />
                        {revealError && <p className="text-sm text-destructive">{revealError}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setRevealSecretId(null); setRevealPin(''); setRevealError(null); }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleReveal} disabled={isRevealing}>
                            {isRevealing ? 'Verifying...' : 'Reveal'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Secrets List */}
            {secrets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No secrets stored yet</p>
                    <p className="text-sm">Add API keys, credentials, and other sensitive data</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {isAdding && (
                        <Card className="p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-44" />
                                    <Skeleton className="h-4 w-56" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                            </div>
                        </Card>
                    )}
                    {secrets.map((secret) => (
                        <Card key={secret.nanoid} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-mono font-medium">{secret.key}</p>
                                    <p className="font-mono text-sm mt-1">
                                        {revealedSecrets[secret.nanoid] ? (
                                            <span className="text-green-600">{revealedSecrets[secret.nanoid]}</span>
                                        ) : (
                                            <span className="text-muted-foreground">••••••••••••</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {revealedSecrets[secret.nanoid] ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => hideSecret(secret.nanoid)}
                                        >
                                            <EyeOff className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setRevealSecretId(secret.nanoid)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(secret.nanoid)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
