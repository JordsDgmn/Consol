'use client';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useState, useRef, useEffect } from 'react';

const columnHelper = createColumnHelper();

export default function HistoryTable({
  sessions = [],
  notes = [],
  onRowHover,
  onRowSelect,
  selectedIndex, // ✅ external selected index
  setSelectedDate, // ✅ NEW: pass this prop from ProfilePage
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00:00';
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const formatDate = (raw) => {
    if (!raw) return 'Invalid Date';
    const date = new Date(raw);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
  };

  const columns = [
    columnHelper.accessor('title', {
      header: 'Note',
      cell: (info) => info.getValue() || 'Untitled',
    }),
    columnHelper.accessor('created_at', {
      header: 'Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('duration_secs', {
      header: 'Duration',
      cell: (info) => formatDuration(info.getValue()),
    }),
  ];

  const rowRefs = useRef([]);

  useEffect(() => {
    if (
      selectedIndex !== null &&
      rowRefs.current[selectedIndex]
    ) {
      // Use 'center' for better visibility when scrolling to distant items
      rowRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [selectedIndex]);

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="min-w-full text-xs text-left text-gray-700">
      <thead className="sticky top-0 bg-white border-b z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-2 py-1 font-semibold whitespace-nowrap"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {sessions.map((s, i) => (
          <tr
            key={s.id}
            ref={(el) => (rowRefs.current[i] = el)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              onRowSelect(s);
              if (setSelectedDate) {
                // Use consistent date formatting
                const dateStr = new Date(s.created_at).toISOString().substring(0, 10);
                setSelectedDate(dateStr);
              }
            }}
            className={`transition-colors cursor-pointer ${
              hoveredIndex === i ? 'bg-purple-100' : ''
            } ${
              selectedIndex === i
                ? 'bg-purple-200 text-purple-700 font-bold'
                : ''
            }`}
          >
            <td className="px-2 py-1">{s.title || 'Untitled'}</td>
            <td className="px-2 py-1">{formatDate(s.created_at)}</td>
            <td className="px-2 py-1">{formatDuration(s.duration_secs)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
