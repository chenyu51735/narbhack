"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'next/navigation';

interface ChatPreview {
  companionEmail: string;
  companionName: string;
  lastMessage: string;
  lastTimestamp: number;
}

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}

export default function MessagesPage() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selected, setSelected] = useState<ChatPreview | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "";
  const searchParams = useSearchParams();
  const [companionProfileImage, setCompanionProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) return;
    const chatPreviews: ChatPreview[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`chat_${userEmail}_`)) {
        const messages = JSON.parse(localStorage.getItem(key) || "[]");
        if (messages.length > 0) {
          const last = messages[messages.length - 1];
          const companionEmail = key.replace(`chat_${userEmail}_`, "");
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
  }, [userEmail]);

  // Auto-select chat if companion param is present
  useEffect(() => {
    const companionParam = searchParams.get('companion');
    if (companionParam) {
      let found = chats.find(c => c.companionEmail === companionParam);
      if (!found) {
        // Try to get username from localStorage
        const companionName = localStorage.getItem(`username_${companionParam}`) || companionParam;
        found = {
          companionEmail: companionParam,
          companionName,
          lastMessage: '',
          lastTimestamp: Date.now(),
        };
        setChats(prev => {
          if (prev.some(c => c.companionEmail === companionParam)) return prev;
          return [found!, ...prev];
        });
      }
      setSelected(found);
    }
  }, [searchParams, chats]);

  useEffect(() => {
    if (!selected || !userEmail) return;
    const key = `chat_${userEmail}_${selected.companionEmail}`;
    const loadMessages = () => {
      const messages = JSON.parse(localStorage.getItem(key) || "[]");
      setChatMessages(messages);
    };
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [selected, userEmail]);

  useEffect(() => {
    if (typeof window !== 'undefined' && selected) {
      const img = localStorage.getItem(`profileImage_${selected.companionEmail}`);
      setCompanionProfileImage(img || null);
    }
  }, [selected]);

  const sendMessage = () => {
    if (!chatInput.trim() || !userEmail || !selected) return;
    const newMsg = { sender: userEmail, text: chatInput, timestamp: Date.now() };
    const newHistory = [...chatMessages, newMsg];
    setChatMessages(newHistory);
    setChatInput("");
    const key1 = `chat_${userEmail}_${selected.companionEmail}`;
    const key2 = `chat_${selected.companionEmail}_${userEmail}`;
    localStorage.setItem(key1, JSON.stringify(newHistory));
    localStorage.setItem(key2, JSON.stringify(newHistory));
    // Set unread flag for recipient
    localStorage.setItem(`unread_${selected.companionEmail}_${userEmail}`, '1');
  };

  // When a chat is opened (selected changes), clear unread flag for that chat
  useEffect(() => {
    if (!selected || !userEmail) return;
    localStorage.removeItem(`unread_${userEmail}_${selected.companionEmail}`);
    window.dispatchEvent(new Event('unread-updated'));
  }, [selected, userEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden" style={{height: '70vh', minHeight: 400}}>
        {/* Conversation List */}
        <div className="w-full md:w-1/3 border-r bg-gray-50 flex flex-col" style={{minWidth: 220}}>
          <div className="p-4 font-bold text-lg border-b">Messages</div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 && (
              <div className="text-center text-gray-400 py-8">No messages yet.</div>
            )}
            {chats.map((chat, idx) => {
              const profileImage = typeof window !== 'undefined' ? localStorage.getItem(`profileImage_${chat.companionEmail}`) : null;
              const hasUnread = typeof window !== 'undefined' && userEmail ? !!localStorage.getItem(`unread_${userEmail}_${chat.companionEmail}`) : false;
              return (
                <div
                  key={idx}
                  className={`p-4 border-b cursor-pointer hover:bg-blue-100 relative ${selected?.companionEmail === chat.companionEmail ? "bg-blue-100" : ""}`}
                  onClick={() => setSelected(chat)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt={chat.companionName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-bold text-purple-700">
                          {chat.companionName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-blue-700 truncate">{chat.companionName}</div>
                      <div className="text-gray-600 text-sm truncate">{chat.lastMessage}</div>
                      <div className="text-xs text-gray-400">{new Date(chat.lastTimestamp).toLocaleString()}</div>
                    </div>
                    {hasUnread && (
                      <span className="ml-2 w-3 h-3 bg-red-600 rounded-full inline-block"></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              <div className="p-4 border-b flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center overflow-hidden">
                  {companionProfileImage ? (
                    <img src={companionProfileImage} alt={selected.companionName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-purple-700">
                      {selected.companionName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{selected.companionName}</div>
                  <div className="text-xs text-gray-500">{selected.companionEmail}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{minHeight: 0}}>
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400 py-8">No messages yet. Say hi!</div>
                )}
                {chatMessages.map((msg, idx) => {
                  const isMe = msg.sender === userEmail;
                  const profileImage = typeof window !== 'undefined' ? localStorage.getItem(`profileImage_${msg.sender}`) : null;
                  const date = new Date(msg.timestamp);
                  const dateString = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${date.toLocaleTimeString()}`;
                  let showTimestamp = false;
                  if (idx === 0) {
                    showTimestamp = true;
                  } else {
                    const prev = chatMessages[idx - 1];
                    if (msg.timestamp - prev.timestamp > 2 * 60 * 1000) {
                      showTimestamp = true;
                    }
                  }
                  return (
                    <div key={idx} className={`mb-2 flex flex-col items-center`}>
                      {showTimestamp && (
                        <div className="flex items-center w-full my-2">
                          <div className="flex-1 border-t border-gray-300"></div>
                          <span className="mx-4 text-xs text-gray-500 whitespace-nowrap">{dateString}</span>
                          <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} items-end w-full`}>
                        {!isMe && (
                          <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center overflow-hidden mr-2">
                            {profileImage ? (
                              <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base font-bold text-purple-700">
                                {selected?.companionName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`rounded-lg px-4 py-2 max-w-xs ${isMe ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}>
                          {msg.text}
                        </div>
                        {isMe && (
                          <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center overflow-hidden ml-2">
                            {profileImage ? (
                              <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base font-bold text-purple-700">
                                {userEmail.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>
              <div className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 