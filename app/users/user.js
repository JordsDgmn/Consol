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
  const [deletingUser, setDeletingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    try {
      // Capture the current user data to avoid state timing issues
      const currentEditingUser = editingUser;
      const currentUserId = currentEditingUser?.id;
      
      if (!profilePictureFile || !currentEditingUser || !currentUserId) {
        alert('Please select a file and ensure user is properly selected');
        return;
      }

      console.log('🚀 Starting upload...', {
        file: profilePictureFile.name,
        userId: currentUserId,
        fileSize: profilePictureFile.size
      });

      setUploading(true);
      
      const formData = new FormData();
      formData.append('profilePicture', profilePictureFile);
      formData.append('userId', currentUserId.toString());

      console.log('📤 Sending request to /api/users/upload-profile');

      const res = await fetch('/api/users/upload-profile', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', res.status);

      const data = await res.json();
      console.log('📥 Response data:', data);
      
      if (res.ok && data?.imageUrl) {
        // Update the users list with the new profile picture
        setUsers(prev => prev.map(u => 
          u.id === currentUserId 
            ? { ...u, profile_picture_url: data.imageUrl }
            : u
        ));
        
        // If this is the current user, update the context too
        try {
          const currentUser = JSON.parse(localStorage.getItem('consol_user') || '{}');
          if (currentUser?.id === currentUserId) {
            const updatedUser = { ...currentUser, profile_picture_url: data.imageUrl };
            localStorage.setItem('consol_user', JSON.stringify(updatedUser));
          }
        } catch (localStorageError) {
          console.warn('Failed to update localStorage:', localStorageError);
        }
        
        // Clear the file first, then the user to avoid timing issues
        setProfilePictureFile(null);
        console.log('[✅ PROFILE PICTURE UPLOADED]', { imageUrl: data.imageUrl, success: true });
        alert('Profile picture uploaded successfully!');
        // Clear editing user at the very end
        setEditingUser(null);
      } else {
        console.error('[❌ UPLOAD FAILED]', data);
        alert('Failed to upload profile picture: ' + (data?.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[❌ UPLOAD ERROR]', err);
      alert('Failed to upload profile picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (e, user) => {
    e.stopPropagation(); // Prevent user selection when clicking delete
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    // Capture the current user data to avoid state timing issues
    const currentDeletingUser = deletingUser;
    
    if (!currentDeletingUser || !currentDeletingUser.id) {
      alert('Invalid user selected for deletion');
      return;
    }

    try {
      console.log('🗑️ Deleting user:', {
        id: currentDeletingUser.id,
        username: currentDeletingUser.username,
        type: typeof currentDeletingUser.id
      });
      
      const res = await fetch(`/api/users/${currentDeletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Delete response status:', res.status);

      if (res.ok) {
        const responseData = await res.json();
        console.log('✅ Delete response:', responseData);
        
        // Remove user from the list
        setUsers(prev => prev.filter(u => u.id !== currentDeletingUser.id));
        
        // If this was the current user, clear the context
        const currentUser = JSON.parse(localStorage.getItem('consol_user') || '{}');
        if (currentUser.id === currentDeletingUser.id) {
          localStorage.removeItem('consol_user');
          // Optionally redirect to users page or show a message
        }
        
        console.log('[✅ USER DELETED]', currentDeletingUser.username);
        alert(`User "${currentDeletingUser.username}" has been deleted successfully.`);
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[❌ DELETE FAILED]', {
          status: res.status,
          statusText: res.statusText,
          data: data
        });
        alert('Failed to delete user: ' + (data.error || `HTTP ${res.status} ${res.statusText}`));
      }
    } catch (err) {
      console.error('[❌ DELETE ERROR]', err);
      alert('Failed to delete user: ' + err.message);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingUser(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingUser(null);
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
              className="cursor-pointer w-full flex items-center justify-between bg-white hover:bg-purple-100 transition-all duration-500 ease-out border border-gray-300 rounded-xl shadow p-6 relative"
            >
              {/* Delete Button - Top Right Corner */}
              <button
                onClick={(e) => handleDeleteClick(e, user)}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 opacity-60 hover:opacity-100"
                title="Delete User"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

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
                {editingUser?.profile_picture_url ? (
                  <img 
                    src={editingUser?.profile_picture_url} 
                    alt={`${editingUser?.username || 'User'}'s profile`}
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
                {editingUser?.username || 'Unknown User'}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Delete User</h3>
            
            {/* Warning Message */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>"{deletingUser?.username || 'Unknown User'}"</strong>?
              </p>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded border-l-4 border-red-400">
                ⚠️ This action cannot be undone. All notes and session data for this user will be permanently deleted.
              </p>
            </div>

            {/* User Info Summary */}
            <div className="mb-6 p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {deletingUser?.profile_picture_url ? (
                    <img 
                      src={deletingUser.profile_picture_url} 
                      alt={`${deletingUser.username}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No Image</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{deletingUser?.username || 'Unknown User'}</p>
                  <p className="text-sm text-gray-600">
                    {deletingUser?.notes || 0} notes • {deletingUser?.speed || 0} avg WPM
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
