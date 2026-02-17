import React, { useState, useEffect } from 'react';
import AdminLayout from './Layout';
import { adminService } from '../../services/adminService';
import { ContactMessage } from '../../types/admin';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await adminService.getContactMessages();
      setMessages(data);
      if (data.length > 0) {
        setActiveMessageId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await adminService.deleteContactMessage(id);
      const remaining = messages.filter(m => m.id !== id);
      setMessages(remaining);
      if (activeMessageId === id && remaining.length > 0) {
        setActiveMessageId(remaining[0].id);
      } else if (remaining.length === 0) {
        setActiveMessageId(null);
      }
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  const activeMessage = messages.find(m => m.id === activeMessageId);

  return (
    <AdminLayout title="Messages">
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Inbox Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Messages</h2>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane: Message List */}
          <section className="w-full md:w-[400px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No messages found.</div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {messages.map(msg => (
                  <MessageItem
                    key={msg.id}
                    id={msg.id}
                    active={activeMessageId === msg.id}
                    onClick={() => setActiveMessageId(msg.id)}
                    name={msg.name}
                    time={new Date(msg.created_at).toLocaleDateString()}
                    subject={msg.status === 'new' ? 'New Inquiry' : 'Response Sent'}
                    preview={msg.message}
                    unread={msg.status === 'new'}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Right Pane: Message Detail */}
          <section className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden hidden md:flex">
            {activeMessage ? (
              <>
                {/* Action Bar */}
                <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(activeMessage.id)} className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors" title="Delete">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="mb-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {activeMessage.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {activeMessage.name}
                            {activeMessage.subject && (
                              <span className="ml-3 text-sm font-normal text-slate-500 block md:inline">
                                {activeMessage.subject}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-slate-500">{activeMessage.email} • {activeMessage.phone || 'No phone'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Sent: {new Date(activeMessage.created_at).toLocaleString()}</p>
                        {activeMessage.status === 'replied' && (
                          <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Replied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <article className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap mb-8">
                    {activeMessage.message}
                  </article>

                  {/* Reply History */}
                  {activeMessage.response && (
                    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">reply</span>
                        <span className="text-sm font-bold">Your Reply</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {activeMessage.response}
                      </p>
                    </div>
                  )}

                  {/* Internal Reply Form */}
                  <div className="mt-12 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compose Reply</span>
                      <span className="text-xs text-slate-400">Email will be sent from help.weddingweb@gmail.com</span>
                    </div>
                    <textarea
                      className="w-full border-none p-4 text-sm focus:ring-0 placeholder:text-slate-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      placeholder="Type your reply here..."
                      rows={6}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={loading}
                    >
                    </textarea>
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-3">
                      <div className="flex-1">
                        {replyText && (
                          <span className="text-[10px] text-slate-400 italic">Pressing Send will deliver an official email to {activeMessage.email}</span>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (!replyText.trim()) return;
                          setLoading(true);
                          try {
                            const updated = await adminService.sendReply(activeMessage.id, replyText);
                            // Update local state
                            setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
                            setReplyText('');
                            alert('Reply sent successfully!');
                          } catch (err: any) {
                            alert('Failed to send reply: ' + err.message);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading || !replyText.trim()}
                        className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                      >
                        {loading ? 'Sending...' : 'Send Reply'}
                        {!loading && <span className="material-symbols-outlined text-sm">send</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                Select a message to view details
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

const MessageItem = ({ name, time, subject, preview, active, unread, stars, hasAttachment, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors relative group ${active ? 'bg-white dark:bg-slate-900 border-l-4 border-l-primary' : 'bg-transparent hover:bg-white dark:hover:bg-slate-900'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`font-bold text-sm ${active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{name}</span>
        <span className="text-[11px] text-slate-500">{time}</span>
      </div>
      <h4 className={`text-xs font-semibold truncate mb-1 ${active ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>{subject}</h4>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{preview}</p>
      <div className="flex gap-2 mt-2">
        {unread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
      </div>
    </div>
  );
};

export default AdminContactMessages;
