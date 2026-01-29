import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();
import { notFound } from 'next/navigation';
import Link from "next/link";

export default async function ViewPaste({ params }) {
  const { id } = params;

  // Fetch paste from KV
  const paste = await kv.get(`paste:${id}`);

  if (!paste) {
    notFound();
  }

  // Check if expired
  const now = Date.now();
  if (paste.expires_at && now >= paste.expires_at) {
    notFound();
  }

  // Check if view limit exceeded
  if (paste.remaining_views !== null && paste.remaining_views <= 0) {
    notFound();
  }

  // Note: We don't decrement views here for the HTML view
  // Only API calls count as views per requirements

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Paste</h1>
            <Link
              href="/"
              className="text-blue-600 hover:underline text-sm"
            >
              Create New Paste
            </Link>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-wrap break-words text-gray-800 font-mono text-sm">
              {paste.content}
            </pre>
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            {paste.remaining_views !== null && (
              <div>
                <span className="font-medium">Remaining views:</span> {paste.remaining_views}
              </div>
            )}
            {paste.expires_at && (
              <div>
                <span className="font-medium">Expires at:</span>{' '}
                {new Date(paste.expires_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
