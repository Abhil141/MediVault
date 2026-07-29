import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Activity, Plus, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp?: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

export default function Chatbot() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all sessions on load
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(res.data);
        if (res.data.length > 0) {
          setCurrentSessionId(res.data[0].id);
        } else {
          // If no sessions, just show the greeting
          setMessages([{
            id: 'greeting',
            role: 'bot',
            content: "Hello! I am MediHelp AI. I'm connected to the Illinois Department of Public Health database. Ask me any medical questions!",
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (e) {
        toast.error("Failed to load chat sessions");
      }
    };
    fetchSessions();
  }, []);

  // Ref to prevent fetching during send
  const isSendingRef = useRef(false);

  // Fetch messages when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId || isSendingRef.current) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/chat/sessions/${currentSessionId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.length === 0) {
           setMessages([{
              id: 'greeting',
              role: 'bot',
              content: "Hello! I am MediHelp AI. I'm connected to the Illinois Department of Public Health database. Ask me any medical questions!",
              timestamp: new Date().toISOString()
            }]);
        } else {
           const dbMessages = res.data.map((m: any) => ({
             id: m.id.toString(),
             role: m.role,
             content: m.content,
             timestamp: m.created_at
           }));
           setMessages([
             {
               id: 'greeting',
               role: 'bot',
               content: "Hello! I am MediHelp AI. I'm connected to the Illinois Department of Public Health database. Ask me any medical questions!",
               timestamp: dbMessages.length > 0 ? dbMessages[0].timestamp : new Date().toISOString()
             },
             ...dbMessages
           ]);
        }
      } catch (e) {
        toast.error("Failed to load chat messages");
      }
    };
    fetchMessages();
  }, [currentSessionId]);

  const createNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{
      id: 'greeting',
      role: 'bot',
      content: "Hello! I am MediHelp AI. I'm connected to the Illinois Department of Public Health database. Ask me any medical questions!",
      timestamp: new Date().toISOString()
    }]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    isSendingRef.current = true;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      let targetSessionId = currentSessionId;
      
      // Create session if it doesn't exist
      if (!targetSessionId) {
        const sessionRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat/sessions`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        targetSessionId = sessionRes.data.id;
        setCurrentSessionId(targetSessionId);
      }

      const response = await axios.post(
        `http://localhost:8000/api/chat/sessions/${targetSessionId}/ask`,
        { message: userMessage.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.data.answer,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);

      // Refresh session list to update titles if this was the first message
      const resList2 = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(resList2.data);

    } catch (error) {
      toast.error("Failed to process message");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "Sorry, I encountered an error connecting to the knowledge base. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingSessionId]);

  const handleRenameClick = (e: React.MouseEvent, sessionId: number, currentTitle: string) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const saveRename = async (sessionId: number) => {
    if (editingTitle && editingTitle.trim()) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8000/api/chat/sessions/${sessionId}/rename`, 
          { title: editingTitle.trim() }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editingTitle.trim() } : s));
      } catch (err) {
        toast.error("Failed to rename session");
      }
    }
    setEditingSessionId(null);
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    // If the backend returns a naive datetime (no Z), append Z so it's parsed as UTC
    const dateStr = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-1rem)] sm:h-[calc(100vh-2.5rem)] animate-in fade-in duration-500 font-sans gap-4 sm:gap-6 overflow-hidden">
      
      {/* Sidebar for Chat Sessions */}
      <div className={`transition-all duration-300 ease-in-out h-full flex flex-col gap-3 shrink-0 overflow-hidden ${isChatSidebarOpen ? 'w-full md:w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
        <div className="w-full md:w-64 flex flex-col gap-3 h-full shrink-0">
          <div className="flex gap-2">
            <button 
              onClick={createNewChat}
              className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> New Chat
            </button>
            <button 
              onClick={() => setIsChatSidebarOpen(false)}
              className="hidden md:flex items-center justify-center p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-500 hover:text-indigo-600 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-zinc-800"
              title="Close Sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>
        
        <div className="flex-1 bg-white dark:bg-zinc-900/90 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-y-auto p-3 flex flex-col gap-2">
           <div className="flex items-center justify-between mb-2 px-2">
             <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Recent Chats</h3>
             <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full" title="To conserve storage, only your 5 most recent sessions are saved.">Limit: 5</span>
           </div>
           {sessions.length === 0 && (
             <p className="text-sm text-slate-500 dark:text-zinc-400 px-2 italic">No recent chats</p>
           )}
           {sessions.map(s => (
             <div key={s.id} className="relative group">
               {editingSessionId === s.id ? (
                 <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50">
                   <MessageSquare className="w-4 h-4 shrink-0 text-indigo-500" />
                   <input
                     ref={editInputRef}
                     type="text"
                     value={editingTitle}
                     onChange={(e) => setEditingTitle(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') saveRename(s.id);
                       if (e.key === 'Escape') cancelRename();
                     }}
                     className="flex-1 min-w-0 w-full bg-white dark:bg-zinc-800 text-sm font-semibold rounded px-2 py-1 outline-none border border-indigo-200 dark:border-indigo-700 focus:border-indigo-400 dark:focus:border-indigo-500"
                   />
                   <div className="flex gap-1 shrink-0">
                     <button onClick={() => saveRename(s.id)} className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded" title="Save">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </button>
                     <button onClick={cancelRename} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Cancel">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                   </div>
                 </div>
               ) : (
                 <>
                   <button
                      onClick={() => setCurrentSessionId(s.id)}
                      className={`flex w-full items-center gap-3 p-3 rounded-xl transition-all text-left pr-16 ${currentSessionId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30' : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-transparent'}`}
                   >
                      <MessageSquare className={`w-4 h-4 shrink-0 ${currentSessionId === s.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className="text-sm font-semibold truncate">{s.title}</span>
                   </button>
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                       onClick={(e) => handleRenameClick(e, s.id, s.title)}
                       className="p-1.5 text-slate-400 hover:text-indigo-500 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700 transition-colors"
                       title="Rename Chat"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                     </button>
                     <button
                       onClick={async (e) => {
                         e.stopPropagation();
                         try {
                           const token = localStorage.getItem('token');
                           await axios.delete(`http://localhost:8000/api/chat/sessions/${s.id}`, {
                             headers: { Authorization: `Bearer ${token}` }
                           });
                           const updatedSessions = sessions.filter(session => session.id !== s.id);
                           setSessions(updatedSessions);
                           if (currentSessionId === s.id) {
                             setCurrentSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
                           }
                         } catch (err) {
                           toast.error("Failed to delete session");
                         }
                       }}
                       className="p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700 transition-colors"
                       title="Delete Chat"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                     </button>
                   </div>
                 </>
               )}
             </div>
           ))}
        </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {!isChatSidebarOpen && (
              <button 
                onClick={() => setIsChatSidebarOpen(true)}
                className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-xl transition-all hidden md:block text-slate-500 hover:text-indigo-600"
                title="Open Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-inner text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                MediHelp AI
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Your intelligent clinical assistant
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className="shrink-0 mt-1 hidden sm:block">
                    {msg.role === 'bot' ? (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col">
                    <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none sm:rounded-tr-none shadow-md shadow-indigo-500/10' 
                        : 'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-tl-none sm:rounded-tl-none shadow-sm'
                    }`}>
                      {msg.role === 'bot' ? (
                        <div className="prose prose-sm md:prose-base dark:prose-invert prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400 prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-p:leading-relaxed prose-li:marker:text-indigo-500 max-w-none text-slate-700 dark:text-zinc-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base font-medium">{msg.content}</p>
                      )}
                    </div>
                    {msg.timestamp && (
                      <span className={`text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 mt-1.5 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[95%] md:max-w-[85%] flex-row">
                  <div className="shrink-0 mt-1 hidden sm:block">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-tl-none shadow-sm flex items-center gap-3">
                     <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                     <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-50/50 dark:bg-zinc-950/50 border-t border-slate-200/80 dark:border-zinc-800">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MediHelp about diseases, symptoms..."
                className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 sm:p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        </div>
    </div>
  );
}
