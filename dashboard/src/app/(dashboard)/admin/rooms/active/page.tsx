'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import { Radio, Users, X } from 'lucide-react';

export default function ActiveRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    const response = await api.rooms.active();
    if (response.success && response.data) {
      setRooms(response.data);
    }
    setLoading(false);
  };

  const handleCloseRoom = async (id: number) => {
    if (!confirm('Close this room?')) return;
    const response = await api.rooms.close(id);
    if (response.success) {
      alert('Room closed');
      loadRooms();
    }
  };

  return (
    <PageTemplate
      title="Active Voice Rooms"
      description="Monitor live voice rooms in real-time"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Radio className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No active rooms
            </h3>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    LIVE
                  </span>
                </div>
                <button
                  onClick={() => handleCloseRoom(room.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {room.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {room.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{room.participants_count || 0} participants</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(room.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </PageTemplate>
  );
}
