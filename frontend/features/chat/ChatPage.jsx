import { MessageCircle, Send, User, ChevronLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { getConversationMessages } from "../../api/messages.js";
import { getConversations } from "../../api/conversations.js";
import { getSocket } from "../../api/socket.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";

export const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(
    location.state?.conversationId || searchParams.get("conversationId") || null
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [isMobileList, setIsMobileList] = useState(!activeConvId);
  const [searchQuery, setSearchQuery] = useState("");
  
  const socket = useMemo(() => getSocket(), []);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeConvId) setIsMobileList(false);
  }, [activeConvId]);

  useEffect(() => {
    let mounted = true;
    getConversations()
      .then((data) => {
        if (!mounted) return;
        setConversations(data);
      })
      .catch((err) => console.error("Failed to load conversations:", err));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    let mounted = true;
    getConversationMessages(activeConvId)
      .then((history) => {
        if (!mounted) return;
        const formatted = history.map((m) => ({
          ...m,
          local: m.sender === (user.id || user._id)
        }));
        setMessages(formatted);
      })
      .catch((err) => console.error("Failed to load messages:", err));
    return () => { mounted = false; };
  }, [activeConvId, user]);

  useEffect(() => {
    if (!user?.id && !user?._id) return;
    const userId = user.id || user._id;
    socket.emit("register", userId);
    
    const onReceiveMessage = (message) => {
      // Update conversations list (bring to top, update last message)
      setConversations(prev => {
        const convExists = prev.find(c => c._id === message.conversation);
        if (convExists) {
          const updated = prev.map(c => 
            c._id === message.conversation 
              ? { ...c, lastMessage: message.msg, lastMessageAt: new Date().toISOString() } 
              : c
          );
          return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        } else {
          // If new conversation, reload list
          getConversations().then(data => setConversations(data));
          return prev;
        }
      });

      if (message.conversation === activeConvId) {
        if (message.sender !== userId) {
          setMessages(current => [...current, message]);
        }
      }
    };

    const onTyping = () => {
      setTyping(true);
      window.setTimeout(() => setTyping(false), 1600);
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("userTyping", onTyping);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("userTyping", onTyping);
    };
  }, [socket, user, activeConvId]);

  const send = (event) => {
    event.preventDefault();
    if (!activeConvId || !text.trim()) return;

    const activeConv = conversations.find(c => c._id === activeConvId);
    if (!activeConv) return;
    
    // Find the other participant's ID
    const myId = user.id || user._id;
    const otherParticipant = activeConv.participants.find(p => (p._id || p.id || p) !== myId);
    const receiverId = otherParticipant?._id || otherParticipant?.id || otherParticipant;

    const payload = {
      sender: myId,
      receiver: receiverId,
      text: text.trim(),
      conversationId: activeConvId
    };

    socket.emit("sendMessage", payload);
    setMessages(current => [...current, { ...payload, msg: payload.text, local: true }]);
    
    // Update local conversations list
    setConversations(prev => {
      const updated = prev.map(c => 
        c._id === activeConvId 
          ? { ...c, lastMessage: text.trim(), lastMessageAt: new Date().toISOString() } 
          : c
      );
      return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });

    setText("");
  };

  const sendTyping = () => {
    const activeConv = conversations.find(c => c._id === activeConvId);
    if (!activeConv) return;
    const myId = user.id || user._id;
    const otherParticipant = activeConv.participants.find(p => (p._id || p.id || p) !== myId);
    if (otherParticipant) {
      const receiverId = otherParticipant._id || otherParticipant.id || otherParticipant;
      socket.emit("typing", { receiver: receiverId });
    }
  };

  const getOtherParticipantName = (conv) => {
    const myId = user?.id || user?._id;
    const other = conv.participants.find(p => p._id !== myId && p.id !== myId);
    return other?.name || "Unknown User";
  };

  const filteredConversations = conversations.filter(c => 
    getOtherParticipantName(c).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-stone-200 ${!isMobileList ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <h2 className="text-xl font-bold text-ink mb-4">Messages</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-stone-500 text-sm">
              No conversations found.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredConversations.map(conv => (
                <button
                  key={conv._id}
                  onClick={() => setActiveConvId(conv._id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-stone-50 transition-colors text-left ${activeConvId === conv._id ? 'bg-mint/20 hover:bg-mint/20' : ''}`}
                >
                  <div className="h-12 w-12 rounded-full bg-mint text-moss flex items-center justify-center shrink-0 font-bold text-lg">
                    {getOtherParticipantName(conv).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-ink truncate pr-2">
                        {getOtherParticipantName(conv)}
                      </h3>
                      <span className="text-xs text-stone-500 shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 truncate">
                      {conv.lastMessage || "Started a conversation"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-stone-50/30 ${isMobileList ? 'hidden md:flex' : 'flex'}`}>
        {activeConvId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-stone-200 flex items-center gap-3">
              <button 
                className="md:hidden p-2 -ml-2 text-stone-500 hover:text-ink rounded-lg hover:bg-stone-100"
                onClick={() => setIsMobileList(true)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 rounded-full bg-mint text-moss flex items-center justify-center font-bold">
                {getOtherParticipantName(conversations.find(c => c._id === activeConvId) || {participants: []}).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-ink">
                  {getOtherParticipantName(conversations.find(c => c._id === activeConvId) || {participants: []})}
                </h3>
                {typing && <p className="text-xs text-moss font-medium">typing...</p>}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-stone-500 text-sm">
                  Send a message to start the conversation.
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={message._id || index} className={`flex ${message.local ? "justify-end" : "justify-start"}`}>
                    <div 
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm
                        ${message.local 
                          ? "bg-ink text-white rounded-tr-sm" 
                          : "bg-white border border-stone-200 text-ink rounded-tl-sm"
                        }`}
                    >
                      {message.msg || message.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form className="p-4 bg-white border-t border-stone-200" onSubmit={send}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={sendTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent transition-all"
                />
                <Button type="submit" disabled={!text.trim()} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="hidden md:flex h-full flex-col items-center justify-center text-stone-500">
            <div className="h-16 w-16 bg-mint rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-moss" />
            </div>
            <p className="text-lg font-medium text-ink mb-1">Your Messages</p>
            <p className="text-sm">Select a conversation from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
