import React, { useEffect, useState } from 'react';

interface ChatPreview {
  companionEmail: string;
  companionName: string;
  lastMessage: string;
  lastTimestamp: number;
}

export function openMessagesModal() {
  window.dispatchEvent(new CustomEvent('open-messages-modal'));
}

const MessagesModal = () => {
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

  useEffect(() => {
    const openListener = () => setOpen(true);
    window.addEventListener('open-messages-modal', openListener);
    return () => window.removeEventListener('open-messages-modal', openListener);
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const chatPreviews: ChatPreview[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`chat_${userEmail}_`)) {
        const messages = JSON.parse(localStorage.getItem(key) || '[]');
        if (messages.length > 0) {
          const last = messages[messages.length - 1];
          const companionEmail = key.replace(`chat_${userEmail}_`, '');
          const companionName = localStorage.getItem(`username_${companionEmail}`) || companionEmail;
          chatPreviews.push({
            companionEmail,
            companionName,
            lastMessage: last.text,
            lastTimestamp: last.timestamp,
          });
        }
      }
    }
    setChats(chatPreviews.sort((a, b) => b.lastTimestamp - a.lastTimestamp));
  }, [userEmail, open]);

  const handleOpenChat = (companionEmail: string) => {
    window.dispatchEvent(new CustomEvent('open-chat-modal', { detail: { companionEmail } }));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-bold text-lg">Messages</div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {chats.length === 0 && (
            <div className="text-center text-gray-400 py-8">No messages yet.</div>
          )}
          {chats.map((chat, idx) => (
            <div key={idx} className="mb-4 cursor-pointer p-2 rounded hover:bg-blue-100" onClick={() => handleOpenChat(chat.companionEmail)}>
              <div className="font-semibold text-blue-700">{chat.companionName}</div>
              <div className="text-gray-600 text-sm truncate">{chat.lastMessage}</div>
              <div className="text-xs text-gray-400">{new Date(chat.lastTimestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessagesModal; 