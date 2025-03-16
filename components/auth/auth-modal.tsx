'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { useCallback, useState } from 'react';

type AuthMode = 'login' | 'register';

export function AuthModal({
  open,
  onOpenChange,
  defaultEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {mode === 'login' ? (
          <LoginForm 
            defaultEmail={defaultEmail}
            onSwitch={() => switchMode('register')}
            onSuccess={() => onOpenChange(false)}
          />
        ) : (
          <RegisterForm
            defaultEmail={defaultEmail}
            onSwitch={() => switchMode('login')}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 