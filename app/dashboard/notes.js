import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

function useNotesLogic(externalNotes, setExternalNotes,  userId) {
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const deletingNotes = useRef(new Set());

  const notes = externalNotes;


  const fetchNotes = useCallback(async () => {
    if (!userId) return; // 🛡️ guard against undefined

    try {
      const res = await fetch(`/api/notes?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      setExternalNotes(data);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  }, [ setExternalNotes, userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const selectedNote = useMemo(() => {
    return Array.isArray(externalNotes)
      ? externalNotes.find((note) => note.id === selectedNoteId) || null
      : null;
  }, [externalNotes, selectedNoteId]);

  const updateNote = async (id, updatedFields) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields }),
      });

      if (!res.ok) throw new Error('Failed to update note');
      const updated = await res.json();

      setExternalNotes((prev) =>
        prev.map((note) => (note.id === id ? updated : note))
      );

      setSelectedNoteId(id);
      console.log(`[✅ Updated] Note ${id} updated.`);
    } catch (err) {
      console.error('Update note failed:', err);
    }
  };

  const deleteNote = async (id) => {
    if (deletingNotes.current.has(id)) return;
    deletingNotes.current.add(id);

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete note');

      setExternalNotes((prev) => prev.filter((note) => note.id !== id));
      if (id === selectedNoteId) setSelectedNoteId(null);

      console.log(`[✅] Note ${id} deleted successfully.`);
    } catch (err) {
      console.error(`[❌] Delete note failed:`, err);
    } finally {
      deletingNotes.current.delete(id);
    }
  };

  return {
    notes: externalNotes,
    selectedNote,
    selectedNoteId,
    setSelectedNoteId,
    updateNote,
    deleteNote,
    
  };
}

export { useNotesLogic };
