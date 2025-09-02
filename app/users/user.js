'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const { setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data);
        console.log('[✅ USERS FETCHED]', data);
      } catch (err) {
        console.error('[❌ USERS FETCH FAILED]', err);
      }
    };

    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!newUsername.trim()) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });
      const data = await res.json();
      setUsers((prev) => [...prev, data]);
      setNewUsername('');
      console.log('[✅ USER CREATED]', data);
    } catch (err) {
      console.error('[❌ CREATE FAILED]', err);
    }
  };

  const handleUserSelect = (user) => {
    setUser(user);
    router.push('/dashboard');
    console.log('👤 User selected:', user);
  };

  return (
    <div className="flex h-[890px] p-8 gap-8 bg-white">
      {/* LEFT: user list */}
      <div className="w-1/2 flex flex-col h-full">
        {/* Header and Create New User */}
        <div className="flex-shrink-0 space-y-6">
          <h1 className="text-3xl font-bold text-black mb-4">Users</h1>
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              placeholder="Enter username"
              className="border border-gray-300 placeholder-gray-400 px-4 py-2 rounded text-gray-700 focus:border-purple-500 focus:outline-none"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <button
              onClick={handleCreate}
              disabled={!newUsername.trim()}
              className={`px-5 py-2 rounded font-semibold transition ${
                newUsername.trim()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer hover:shadow-lg'
                  : 'bg-white border border-purple-400 text-purple-600 cursor-default hover:shadow-lg'
              }`}
            >
              + Create New User
            </button>
          </div>
        </div>

        {/* User Cards */}
        <div className="flex-1 h-[900px] overflow-y-auto space-y-6 pr-2">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="cursor-pointer w-full flex items-center justify-between bg-white hover:bg-purple-100 transition-all duration-500 ease-out border border-gray-300 rounded-xl shadow p-6"
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border border-gray-400 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  [ Profile Picture ]
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black">{user.username}</h2>
                  <div className="text-sm text-gray-700 mt-1">
                    <div className="flex gap-4">
                      <div>
                        <div className="font-bold text-lg">{user.notes || 0}</div>
                        <div className="text-xs text-gray-500">Notes</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{user.speed || 0}</div>
                        <div className="text-xs text-gray-500">Speed</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{user.mastery || 0}</div>
                        <div className="text-xs text-gray-500">Mastery</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{user.comprehension || 0}</div>
                        <div className="text-xs text-gray-500">Comprehension</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Last Active:<br />
                      {user.last_active
                        ? new Date(user.last_active).toLocaleDateString('en-US')
                        : 'No Activity'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT: Placeholder Area */}
      <div className="w-1/2 h-full rounded-xl border border-gray-500 bg-[#1a1a1a] opacity-60 flex items-center justify-center">
        <p className="text-gray-400 italic">[Optional Welcome Graphic or Illustration]</p>
      </div>
    </div>
  );
}
