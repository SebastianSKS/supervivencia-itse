import { getPosts } from '@/actions/posts';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Feed from '@/components/Feed';

export const dynamic = 'force-dynamic';

export default async function WallPage() {
  const [session, posts] = await Promise.all([getSession(), getPosts()]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="w-full">
        <Feed 
          initialPosts={posts} 
          currentUserId={session?.userId ?? null} 
          hasSession={!!session} 
          loadError={null} 
        />
      </main>
    </div>
  );
}
