import { auth } from '@/app/(auth)/auth';
import { getUser } from '@/lib/db/queries';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  // If email is provided, get user data from the database
  if (email) {
    try {
      const users = await getUser(email);
      return Response.json(users);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return Response.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
  }

  // Otherwise return the current session user
  const session = await auth();

  if (!session || !session.user) {
    return Response.json(null);
  }

  return Response.json(session.user);
} 