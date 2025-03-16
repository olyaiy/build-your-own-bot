'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubmitButton } from '@/components/util/submit-button';
import { login, register, type LoginActionState, type RegisterActionState } from '@/app/(auth)/actions';

interface AuthPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthPopup({ isOpen, onOpenChange, onSuccess }: AuthPopupProps) {

  const [activeTab, setActiveTab] = useState<string>('login');
  const [email, setEmail] = useState('');

  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);

  // Handle login form submission
  const handleLoginSubmit = async (formData: FormData) => {
    try {
      setEmail(formData.get('email') as string);
      
      // Create initial state object
      const initialState: LoginActionState = { status: 'idle' };
      const result = await login(initialState, formData);
      
      if (result.status === 'success') {
        setIsLoginSuccessful(true);
        toast.success('Login successful');
        if (onSuccess) onSuccess();
      } else if (result.status === 'invalid_data') {
        toast.error('Failed validating your submission!');
      } else {
        toast.error('Invalid credentials!');
      }
    } catch (error) {
      toast.error('Failed to login');
    } 
  };

  // Handle register form submission
  const handleRegisterSubmit = async (formData: FormData) => {
    try {
      setEmail(formData.get('email') as string);
      
      // Create initial state object
      const initialState: RegisterActionState = { status: 'idle' };
      const result = await register(initialState, formData);
      
      if (result.status === 'success') {
        toast.success('Account created successfully');
        setActiveTab('login');
      } else if (result.status === 'user_exists') {
        toast.error('Account already exists');
        setActiveTab('login');
      } else if (result.status === 'invalid_data') {
        toast.error('Failed validating your submission!');
      } else {
        toast.error('Failed to create account');
      }
    } catch (error) {
      toast.error('Failed to register');
    } 
  };

  // Custom form submission to prevent page reload
  const handleFormSubmission = (e: FormEvent, tab: 'login' | 'register') => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    if (tab === 'login') {
      handleLoginSubmit(formData);
    } else {
      handleRegisterSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Authentication Required</DialogTitle>
          <DialogDescription className="text-center">
            Please sign in or create an account to continue
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <form className="flex flex-col gap-4 px-4 sm:px-16" onSubmit={(e) => handleFormSubmission(e, 'login')}>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  className="bg-muted text-md md:text-sm p-2 rounded-md border border-input"
                  type="email"
                  placeholder="user@acme.com"
                  autoComplete="email"
                  required
                  autoFocus
                  defaultValue={email}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  className="bg-muted text-md md:text-sm p-2 rounded-md border border-input"
                  type="password"
                  required
                />
              </div>
              <SubmitButton isSuccessful={isLoginSuccessful}>Sign in</SubmitButton>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="mt-0">
            <form className="flex flex-col gap-4 px-4 sm:px-16" onSubmit={(e) => handleFormSubmission(e, 'register')}>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  className="bg-muted text-md md:text-sm p-2 rounded-md border border-input"
                  type="email"
                  placeholder="user@acme.com"
                  autoComplete="email"
                  required
                  autoFocus
                  defaultValue={email}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  className="bg-muted text-md md:text-sm p-2 rounded-md border border-input"
                  type="password"
                  required
                />
              </div>
              <SubmitButton isSuccessful={false}>Sign up</SubmitButton>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}