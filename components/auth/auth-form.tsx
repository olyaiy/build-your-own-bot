import Form from 'next/form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  additionalFields,
  className = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  additionalFields?: React.ReactNode;
  className?: string;
}) {
  return (
    <Form action={action} className={`flex flex-col gap-4 px-4 sm:px-16 ${className}`}>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      {/* Render additional fields if provided */}
      {additionalFields}

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
        />
      </div>

      {children}
    </Form>
  );
}
