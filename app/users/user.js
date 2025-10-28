'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const handleEditClick = (e, user) => {
    e.stopPropagation(); // Prevent user selection when clicking edit
    setEditingUser(user);
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile || !editingUser) {
      alert('Please select a file first');
      return;
    }

    console.log('🚀 Starting upload...', {
      file: profilePictureFile.name,
      userId: editingUser.id,
      fileSize: profilePictureFile.size
    });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePictureFile);
      formData.append('userId', editingUser.id.toString());

      console.log('📤 Sending request to /api/users/upload-profile');

      const res = await fetch('/api/users/upload-profile', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', res.status);

      const data = await res.json();
      console.log('📥 Response data:', data);
      
      if (res.ok) {
        // Update the users list with the new profile picture
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, profile_picture_url: data.imageUrl }
            : u
        ));
        
        // If this is the current user, update the context too
        const currentUser = JSON.parse(localStorage.getItem('consol_user') || '{}');
        if (currentUser.id === editingUser.id) {
          const updatedUser = { ...currentUser, profile_picture_url: data.imageUrl };
          localStorage.setItem('consol_user', JSON.stringify(updatedUser));
        }
        
        setEditingUser(null);
        setProfilePictureFile(null);
        console.log('[✅ PROFILE PICTURE UPLOADED]', data);
        alert('Profile picture uploaded successfully!');
      } else {
        console.error('[❌ UPLOAD FAILED]', data);
        alert('Failed to upload profile picture: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[❌ UPLOAD ERROR]', err);
      alert('Failed to upload profile picture: ' + err.message);
    } finally {
      setUploading(false);
    }
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
                <div className="w-24 h-24 rounded-full border border-gray-400 bg-gray-100 flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                  {user.profile_picture_url ? (
                    <img 
                      src={user.profile_picture_url} 
                      alt={`${user.username}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>[ Profile Picture ]</span>
                  )}
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
              
              {/* Edit Button */}
              <button
                onClick={(e) => handleEditClick(e, user)}
                className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition"
              >
                Edit Profile
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT: Placeholder Area */}
      <div className="w-1/2 h-full rounded-xl border border-gray-500 bg-[#1a1a1a] opacity-60 flex items-center justify-center">
        <p className="text-gray-400 italic">[Optional Welcome Graphic or Illustration]</p>
      </div>

      {/* Profile Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            
            {/* Current Profile Picture */}
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                {editingUser.profile_picture_url ? (
                  <img 
                    src={editingUser.profile_picture_url} 
                    alt={`${editingUser.username}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-xs">No Image</span>
                )}
              </div>
            </div>

            {/* Username Display */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                {editingUser.username}
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePictureFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setProfilePictureFile(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProfilePictureUpload}
                disabled={!profilePictureFile || uploading}
                className={`flex-1 px-4 py-2 rounded text-white ${
                  profilePictureFile && !uploading
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload Picture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
