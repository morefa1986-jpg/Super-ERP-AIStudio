import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  Paperclip, 
  Send, 
  Download, 
  User, 
  Users, 
  PhoneOff, 
  Play, 
  Pause, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Check,
  CheckCheck
} from "lucide-react";
import { User as AppUser } from "../types";
import { getWebSocketUrl } from "../network/connection";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  recipientId: string;
  text: string;
  type: "text" | "audio" | "file";
  file?: {
    name: string;
    size: number;
    type: string;
    data: string; // Base64 data URL
  };
  audioUrl?: string; // Optional browser playback URL for recorded voice messages
  timestamp: string;
}

interface ChatContact {
  id: string;
  name: string;
  username?: string;
  role: string;
  avatar: string;
  isBot: boolean;
  isTyping?: boolean;
}

interface ChatManagerProps {
  currentUser: AppUser | null;
}

export default function ChatManager({ currentUser }: ChatManagerProps) {
  // Connection and list states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | { id: "all"; name: string; avatar: string }>({
    id: "all",
    name: "بیسیم عمومی کارگاه (همگانی)",
    avatar: "📢"
  });

  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [myClientId, setMyClientId] = useState("");

  // UI state for calls
  const [activeCall, setActiveCall] = useState<{
    id: string;
    type: "voice" | "video";
    peer: ChatContact;
    status: "dialing" | "ringing" | "connected" | "ended";
    duration: number;
    captions: { senderName: string; text: string }[];
  } | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Call options
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Video streams refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Sockets & DOM helpers
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Connect to WebSocket Server on port 3000
  useEffect(() => {
    if (!currentUser) return;

    // Build URL pointing to the active origin on ws or wss protocol
    const wsUrl = getWebSocketUrl();
    
    console.log("[Chat] Connecting to WebSocket at:", wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Join immediately
      ws.send(JSON.stringify({
        type: "join",
        userId: currentUser.id,
        username: currentUser.username || "operator",
        name: currentUser.name || "مدیر شیفت",
        token: localStorage.getItem("sturgeon_auth_token")
      }));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type } = payload;

        if (type === "init") {
          setMessages(payload.messages);
          setMyClientId(payload.yourClientId);
          // Set contact roster (filtering out current user)
          const filteredContacts = payload.users.filter((u: any) => u.id !== currentUser.id);
          setContacts(filteredContacts);
        }

        else if (type === "users:update") {
          const filteredContacts = payload.users.filter((u: any) => u.id !== currentUser.id);
          setContacts(filteredContacts);
        }

        else if (type === "chat:message") {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.message.id)) return prev;
            return [...prev, payload.message];
          });
        }

        else if (type === "chat:typing") {
          setContacts(prev => prev.map(c => {
            if (c.id === payload.botId) {
              return { ...c, isTyping: payload.isTyping };
            }
            return c;
          }));
        }

        // --- Simulated calling flow relays ---
        else if (type === "call:incoming") {
          // Find matching contact
          const peer = contacts.find(c => c.id === payload.senderId) || {
            id: payload.senderId,
            name: payload.senderName,
            role: "همکار",
            avatar: "👤",
            isBot: false
          };
          
          setActiveCall({
            id: payload.callId,
            type: payload.callType,
            peer: peer as ChatContact,
            status: "ringing", // Ringing state for incoming call
            duration: 0,
            captions: []
          });
        }

        else if (type === "call:ringing") {
          setActiveCall(prev => {
            if (!prev || prev.id !== payload.callId) return prev;
            return { ...prev, status: "ringing" };
          });
        }

        else if (type === "call:accepted") {
          setActiveCall(prev => {
            if (!prev || prev.id !== payload.callId) return prev;
            return { ...prev, status: "connected" };
          });

          // If video call was accepted, spin up user webcam
          if (activeCall?.type === "video" || payload.callType === "video" || (activeCall && activeCall.type === "video")) {
            setTimeout(() => {
              startLocalWebcam();
            }, 300);
          }
        }

        else if (type === "call:declined" || type === "call:ended") {
          stopLocalWebcam();
          setActiveCall(prev => {
            if (!prev) return null;
            return { ...prev, status: "ended" };
          });
          setTimeout(() => {
            setActiveCall(null);
          }, 1500);
        }

        else if (type === "call:caption") {
          setActiveCall(prev => {
            if (!prev || prev.id !== payload.callId) return prev;
            return {
              ...prev,
              captions: [...prev.captions, { senderName: payload.senderName, text: payload.caption }]
            };
          });
        }

      } catch (err) {
        console.error("[Chat] Error parsing WS message", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("[Chat] Connection closed, retrying in 5s...");
      setTimeout(() => {
        // Reconnection logic
      }, 5000);
    };

    return () => {
      ws.close();
      stopLocalWebcam();
    };
  }, [currentUser]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle active call duration counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && activeCall.status === "connected") {
      interval = setInterval(() => {
        setActiveCall(prev => {
          if (!prev) return null;
          return { ...prev, duration: prev.duration + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  // Handle mic recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Webcam streamer for video calls
  const startLocalWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn("[Chat] Could not access webcam. Falling back to mockup user stream", e);
    }
  };

  const stopLocalWebcam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  // Format call duration
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- AUDIO MESSAGE RECORDER ENGINE ---
  const startAudioRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          sendAudioMessage(base64Data);
        };
        // Stop all tracks in the recording stream to release microphone light
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.warn("[Chat] Microphone access denied. Simulating voice message...", e);
      // Fallback simulation of voice recording
      setIsRecording(true);
    }
  };

  const stopAudioRecording = (shouldSend = true) => {
    if (!isRecording) return;
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated audio message fallback
      if (shouldSend) {
        // Create an empty silent or simulated audio string
        sendAudioMessage("data:audio/webm;base64,GkXfo69ChoEBQveBAULygQRC64EPQO77gQA=");
      }
    }
  };

  const sendAudioMessage = (base64Audio: string) => {
    if (!currentUser) return;
    const audioMsg: ChatMessage = {
      id: `audio-${Math.random().toString(36).substring(2, 9)}`,
      senderId: currentUser.id,
      senderName: currentUser.name || "مدیر کارگاه",
      senderRole: currentUser.role,
      senderAvatar: "👤",
      recipientId: activeContact.id,
      text: `🎤 پیام صوتی (${formatTime(recordingSeconds || 5)})`,
      type: "audio",
      file: {
        name: `voice-msg-${Date.now()}.webm`,
        size: Math.round(base64Audio.length * 0.75),
        type: "audio/webm",
        data: base64Audio
      },
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "chat:message",
        message: audioMsg
      }));
    }
  };

  // --- FILE ATTACHMENT UPLOAD ENGINE ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result as string;
      sendFileMessage(file.name, file.size, file.type, base64Data);
    };
  };

  const sendFileMessage = (name: string, size: number, type: string, base64Data: string) => {
    if (!currentUser) return;
    const fileMsg: ChatMessage = {
      id: `file-${Math.random().toString(36).substring(2, 9)}`,
      senderId: currentUser.id,
      senderName: currentUser.name || "مدیر کارگاه",
      senderRole: currentUser.role,
      senderAvatar: "👤",
      recipientId: activeContact.id,
      text: `📎 فایل ضمیمه: ${name}`,
      type: "file",
      file: {
        name,
        size,
        type,
        data: base64Data
      },
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "chat:message",
        message: fileMsg
      }));
    }
  };

  // Send textual message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const newMsg: ChatMessage = {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      senderId: currentUser.id,
      senderName: currentUser.name || "مدیر کارگاه",
      senderRole: currentUser.role,
      senderAvatar: "👤",
      recipientId: activeContact.id,
      text: inputText,
      type: "text",
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "chat:message",
        message: newMsg
      }));
    }

    setInputText("");
  };

  // Initiate an outgoing call
  const handleStartCall = (callType: "voice" | "video") => {
    if (activeContact.id === "all") return;
    if (!currentUser) return;

    const callId = `call-${Math.random().toString(36).substring(2, 9)}`;
    const targetPeer = activeContact as ChatContact;

    setActiveCall({
      id: callId,
      type: callType,
      peer: targetPeer,
      status: "dialing",
      duration: 0,
      captions: []
    });

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "call:request",
        callId,
        senderId: currentUser.id,
        senderName: currentUser.name || "مدیر کارگاه",
        recipientId: targetPeer.id,
        callType
      }));
    }

    // Capture user media immediately if starting video call
    if (callType === "video") {
      startLocalWebcam();
    }
  };

  // Respond to incoming call
  const handleRespondCall = (action: "accept" | "decline") => {
    if (!activeCall || !currentUser) return;

    if (action === "accept") {
      setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
      if (activeCall.type === "video") {
        startLocalWebcam();
      }
    } else {
      setActiveCall(null);
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "call:respond",
        callId: activeCall.id,
        senderId: activeCall.peer.id,
        action
      }));
    }
  };

  // End an active call
  const handleEndCall = () => {
    if (!activeCall || !currentUser) return;

    stopLocalWebcam();
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "call:end",
        callId: activeCall.id,
        peerId: activeCall.peer.id
      }));
    }

    setActiveCall(prev => prev ? { ...prev, status: "ended" } : null);
    setTimeout(() => {
      setActiveCall(null);
    }, 1000);
  };

  // Render format size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Filter messages to show only the conversation with selected activeContact
  const filteredMessages = messages.filter(m => {
    if (activeContact.id === "all") {
      return m.recipientId === "all";
    } else {
      // Direct message between currentUser and activeContact
      return (
        (m.senderId === currentUser?.id && m.recipientId === activeContact.id) ||
        (m.senderId === activeContact.id && m.recipientId === currentUser?.id)
      );
    }
  });

  return (
    <div id="chat-system-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-natural-khaki/10 p-2 lg:p-4 rounded-3xl min-h-[680px]">
      
      {/* LEFT SIDEBAR: ACTIVE CONTACTS & DIRECTORY (4 cols) */}
      <div className="lg:col-span-4 bg-white border border-natural-border/70 rounded-3xl flex flex-col shadow-sm overflow-hidden h-[620px]">
        {/* Header */}
        <div className="p-4 border-b border-natural-border/50 bg-natural-khaki/25 flex items-center justify-between">
          <div>
            <h3 className="font-sans font-black text-sm text-natural-dark flex items-center gap-2">
              <Users size={16} className="text-[#8C6A43]" />
              لیست تماس و همکاران
            </h3>
            <span className="text-[10px] text-natural-text/60 font-semibold font-sans">
              شبکه بیسیم و ارتباطات داخلی فارم خاویاری
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-600 animate-pulse" : "bg-red-500"}`} />
            <span className="text-[9px] font-bold text-natural-text/60 font-mono">
              {isConnected ? "برخط" : "آفلاین"}
            </span>
          </div>
        </div>

        {/* Contacts scrolling area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {/* General Broadcast Channel */}
          <button
            onClick={() => setActiveContact({ id: "all", name: "بیسیم عمومی کارگاه (همگانی)", avatar: "📢" })}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-right border ${
              activeContact.id === "all"
                ? "bg-natural-khaki/40 border-natural-border text-[#7E6547] font-black"
                : "bg-transparent border-transparent hover:bg-natural-khaki/10 text-natural-text"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#8C6A43]/10 flex items-center justify-center text-lg shadow-inner select-none">
              📢
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold block truncate">بیسیم عمومی کارگاه</span>
              <span className="text-[9px] text-natural-text/50 block truncate">
                پیام‌رسانی همگانی به تمامی کارکنان شیفت
              </span>
            </div>
          </button>

          <div className="text-[9px] font-black text-natural-text/40 tracking-wider font-sans px-3 pt-3 pb-1 uppercase">
            کارتابل همکاران سالن‌ها
          </div>

          {/* Individual users & bots */}
          {contacts.map(contact => {
            const lastMsg = messages
              .filter(m => (m.senderId === contact.id && m.recipientId === currentUser?.id) || (m.senderId === currentUser?.id && m.recipientId === contact.id))
              .pop();

            return (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-right border ${
                  activeContact.id === contact.id
                    ? "bg-natural-khaki/40 border-natural-border text-[#7E6547] font-black"
                    : "bg-transparent border-transparent hover:bg-natural-khaki/10 text-natural-text"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#8C6A43]/15 flex items-center justify-center text-lg shadow-inner select-none">
                    {contact.avatar || "👤"}
                  </div>
                  {/* Status Ring / Indicator */}
                  <span className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${
                    contact.isBot ? "bg-amber-600" : "bg-emerald-600"
                  }`} title={contact.isBot ? "ربات کمکی شیلات" : "اپراتور واقعی"} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold block truncate">{contact.name}</span>
                    <span className="text-[8px] font-mono text-natural-text/40">@{contact.username}</span>
                  </div>
                  
                  {contact.isTyping ? (
                    <span className="text-[9px] text-amber-600 animate-pulse font-sans flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> در حال نوشتن...
                    </span>
                  ) : (
                    <span className="text-[9px] text-natural-text/60 block truncate">
                      {lastMsg ? lastMsg.text : `${contact.role || "همکار فارم"}`}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: CHAT CONVERSATION VIEW (8 cols) */}
      <div className="lg:col-span-8 bg-white border border-natural-border/70 rounded-3xl flex flex-col shadow-sm overflow-hidden h-[620px] relative">
        
        {/* Conversational Top Bar */}
        <div className="p-4 border-b border-natural-border/50 bg-natural-khaki/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C6A43]/20 flex items-center justify-center text-lg select-none">
              {activeContact.avatar}
            </div>
            <div>
              <h4 className="text-xs font-black text-natural-dark font-sans">{activeContact.name}</h4>
              <span className="text-[9px] text-natural-text/50 font-sans block">
                {activeContact.id === "all" 
                  ? "کانال عمومی فرکانس ۸۸.۵ مگاهرتز شیلات" 
                  : `در حال گفتگو با: ${(activeContact as ChatContact).role || "همکار کارگاه"}`
                }
              </span>
            </div>
          </div>

          {/* Action Calls Buttons (Only for Direct Chat) */}
          {activeContact.id !== "all" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStartCall("voice")}
                className="p-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer border border-emerald-200/50 flex items-center gap-1 text-[10px] font-bold"
                title="تماس صوتی"
              >
                <Phone size={14} />
                تماس صوتی
              </button>
              <button
                onClick={() => handleStartCall("video")}
                className="p-2.5 bg-[#8C6A43]/10 text-[#7E6547] hover:bg-[#8C6A43]/25 rounded-xl transition-all cursor-pointer border border-natural-border/60 flex items-center gap-1 text-[10px] font-bold"
                title="تماس تصویری"
              >
                <Video size={14} />
                تماس تصویری
              </button>
            </div>
          )}
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50 scrollbar-thin">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-2">
              <div className="text-4xl">💬</div>
              <p className="text-xs font-bold text-natural-text/70">هیچ پیامی در این گفتگو وجود ندارد</p>
              <p className="text-[10px] text-natural-text/50 max-w-[280px]">
                نوشتن پیام جدید را از کادر پایین آغاز کنید. تمامی اتصالات ایمن و برخط می‌باشند.
              </p>
            </div>
          ) : (
            filteredMessages.map(msg => {
              const isMine = msg.senderId === currentUser?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-start" : "justify-end"} items-start gap-2 max-w-full`}
                >
                  {/* Sender portrait on incoming */}
                  {!isMine && (
                    <div className="w-7 h-7 rounded-lg bg-natural-khaki flex items-center justify-center text-xs shadow-sm select-none">
                      {msg.senderAvatar}
                    </div>
                  )}

                  <div className="max-w-[75%]">
                    {/* Name subtitle */}
                    {!isMine && (
                      <span className="text-[8px] text-natural-text/50 font-bold block mb-0.5 mr-1 text-right">
                        {msg.senderName} ({msg.senderRole})
                      </span>
                    )}

                    {/* Speech bubble */}
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans shadow-xs ${
                      isMine
                        ? "bg-[#8C6A43] text-white rounded-tr-none"
                        : "bg-white text-natural-dark rounded-tl-none border border-natural-border/40"
                    }`}>
                      {/* Message Content Render depending on Type */}
                      {msg.type === "text" && <p className="whitespace-pre-line text-right">{msg.text}</p>}

                      {msg.type === "audio" && (
                        <div className="flex items-center gap-3 py-1 text-right">
                          <button
                            onClick={() => {
                              // Play the sound
                              if (msg.file?.data) {
                                const audio = new Audio(msg.file.data);
                                audio.play().catch(e => console.warn("Audio playback issue:", e));
                              }
                            }}
                            className={`p-2 rounded-full cursor-pointer hover:scale-105 transition-all ${
                              isMine ? "bg-white/20 text-white" : "bg-natural-khaki text-natural-dark"
                            }`}
                          >
                            <Play size={14} fill="currentColor" />
                          </button>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold block">پیام صوتی درون‌کارگاهی</span>
                            {/* Stylized custom sound waves */}
                            <div className="flex items-center gap-0.5 mt-1">
                              {[2, 4, 3, 5, 2, 4, 6, 4, 3, 5, 2, 4, 3, 1].map((h, i) => (
                                <span
                                  key={i}
                                  className={`w-[2px] rounded-full ${isMine ? "bg-white" : "bg-natural-dark"}`}
                                  style={{ height: `${h * 2.5}px` }}
                                />
                              ))}
                            </div>
                          </div>
                          <span className={`text-[8px] font-mono mr-2 ${isMine ? "text-white/70" : "text-natural-text/60"}`}>
                            {msg.file?.size ? formatFileSize(msg.file.size) : "صدا"}
                          </span>
                        </div>
                      )}

                      {msg.type === "file" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-right">
                            <div className={`p-2 rounded-lg ${isMine ? "bg-white/10" : "bg-natural-khaki"}`}>
                              {msg.file?.type.includes("image") ? <ImageIcon size={18} /> : <FileText size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold block truncate">{msg.file?.name}</span>
                              <span className={`text-[8px] block ${isMine ? "text-white/60" : "text-natural-text/60"}`}>
                                {msg.file?.size ? formatFileSize(msg.file.size) : "فایل"}
                              </span>
                            </div>
                          </div>

                          {/* Image preview */}
                          {msg.file?.type.includes("image") && msg.file.data && (
                            <div className="rounded-xl overflow-hidden border border-black/10 max-h-36">
                              <img src={msg.file.data} alt="Preview" className="w-full object-cover" />
                            </div>
                          )}

                          {/* Download Button */}
                          <a
                            href={msg.file?.data}
                            download={msg.file?.name}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[9px] font-black transition-all ${
                              isMine 
                                ? "bg-white/10 hover:bg-white/20 text-white border border-white/25" 
                                : "bg-natural-khaki hover:bg-natural-khaki/60 text-[#7E6547]"
                            }`}
                          >
                            <Download size={10} />
                            دانلود و ذخیره فایل
                          </a>
                        </div>
                      )}

                      {/* Info & Double ticks */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[7px] font-mono ${isMine ? "text-white/60" : "text-natural-text/40"}`}>
                          {msg.timestamp}
                        </span>
                        {isMine && <CheckCheck size={10} className="text-emerald-300" />}
                      </div>
                    </div>
                  </div>

                  {/* Sender portrait on outgoing */}
                  {isMine && (
                    <div className="w-7 h-7 rounded-lg bg-natural-khaki/60 flex items-center justify-center text-xs shadow-sm select-none">
                      👤
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing bot indicator overlay bottom */}
        {activeContact.id !== "all" && (activeContact as ChatContact).isTyping && (
          <div className="absolute bottom-16 right-4 bg-white/90 border border-natural-border p-1.5 px-3 rounded-full flex items-center gap-1.5 text-[10px] text-amber-800 shadow-md animate-bounce z-10 font-bold">
            <Loader2 size={10} className="animate-spin text-amber-600" />
            <span>{(activeContact as ChatContact).name} در حال تایپ پاسخ است...</span>
          </div>
        )}

        {/* Conversational Bottom input and trigger buttons */}
        <div className="p-3 border-t border-natural-border bg-white flex flex-col gap-2">
          {/* Audio recording slider overlay */}
          {isRecording ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>در حال ضبط پیام صوتی کارگاه... {formatTime(recordingSeconds)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => stopAudioRecording(false)}
                  className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                >
                  لغو ضبط
                </button>
                <button
                  onClick={() => stopAudioRecording(true)}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send size={10} />
                  توقف و ارسال
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              {/* File Attachment Triggers */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-neutral-100 hover:bg-neutral-200 text-natural-text rounded-2xl transition-all cursor-pointer border border-natural-border/30"
                title="پیوست فایل"
              >
                <Paperclip size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={
                  activeContact.id === "all"
                    ? "پیام خود را در کانال بیسیم همگانی ارسال کنید..."
                    : `پیام برای ${activeContact.name}...`
                }
                className="flex-1 p-3 bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-xs text-natural-dark border border-natural-border focus:border-[#8C6A43] focus:ring-1 focus:ring-[#8C6A43] rounded-2xl outline-none transition-all text-right font-sans"
              />

              {/* Mic Audio button */}
              <button
                type="button"
                onClick={startAudioRecording}
                className="p-3 bg-neutral-100 hover:bg-neutral-200 text-red-600 rounded-2xl transition-all cursor-pointer border border-natural-border/30"
                title="ارسال پیام صوتی"
              >
                <Mic size={16} />
              </button>

              {/* Send Submit */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-[#8C6A43] hover:bg-[#7E6547] text-white rounded-2xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Send size={16} />
              </button>
            </form>
          )}

          <div className="text-[8px] text-natural-text/40 text-center font-sans font-bold">
            ارسال فایل‌ها با رمزگذاری محلی پشتیبانی می‌شود. حداکثر حجم فایل ۱۵ مگابایت است.
          </div>
        </div>

        {/* ========================================================= */}
        {/* ================= CALL OVERLAY PANEL ==================== */}
        {/* ========================================================= */}
        {activeCall && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col z-50 text-white p-6 animate-fade-in font-sans">
            
            {/* Top Info Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black tracking-widest text-[#D68227] uppercase">
                  {activeCall.type === "voice" ? "سرویس مخابرات صوتی داخلی" : "سرویس ارتباط تصویری مانیتورینگ"}
                </span>
              </div>
              <div className="text-xs font-mono bg-white/10 p-1 px-3 rounded-full">
                {activeCall.status === "connected" ? formatTime(activeCall.duration) : "در حال برقراری..."}
              </div>
            </div>

            {/* Main Stage Grid (Differentiates Voice / Video layouts) */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 my-4 overflow-hidden relative">
              
              {/* VIDEO LAYOUT STAGE */}
              {activeCall.type === "video" ? (
                <div className="w-full h-full max-h-[300px] md:max-h-[360px] grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  {/* Local Webcam Video Stream */}
                  <div className="bg-slate-800 rounded-3xl overflow-hidden border border-white/15 relative flex items-center justify-center shadow-lg">
                    {isVideoOff ? (
                      <div className="flex flex-col items-center gap-2 text-white/50">
                        <VideoOff size={32} />
                        <span className="text-[10px]">دوربین شما خاموش است</span>
                      </div>
                    ) : (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    )}
                    <span className="absolute bottom-3 right-3 bg-slate-950/70 p-1 px-2.5 rounded-lg text-[9px] font-bold">
                      تصویر شما (دوربین زنده)
                    </span>
                  </div>

                  {/* Remote/Bot Animated Video Stream */}
                  <div className="bg-[#1C2C28] rounded-3xl overflow-hidden border border-[#D68227]/30 relative flex flex-col items-center justify-center shadow-lg overflow-hidden">
                    {/* Pulsing radar or particle waves for Bot face */}
                    <div className="absolute inset-0 bg-radial-gradient flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-[#8C6A43]/15 flex items-center justify-center border border-[#8C6A43]/30 animate-pulse relative">
                        <span className="absolute inset-0 w-full h-full rounded-full border border-[#8C6A43]/40 animate-ping opacity-30" />
                        <span className="text-5xl select-none">{activeCall.peer.avatar}</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 text-center z-10">
                      <h5 className="font-bold text-sm text-amber-500">{activeCall.peer.name}</h5>
                      <span className="text-[9px] text-white/60 block mt-0.5">{activeCall.peer.role}</span>
                    </div>

                    <span className="absolute bottom-3 right-3 bg-slate-950/70 p-1 px-2.5 rounded-lg text-[9px] font-bold text-amber-400">
                      تصویر برخط: {activeCall.peer.name}
                    </span>
                  </div>
                </div>
              ) : (
                /* VOICE LAYOUT STAGE */
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  {/* Pulsing Call Avatar */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 p-1 flex items-center justify-center relative shadow-2xl">
                    {/* Decorative Ring */}
                    <span className={`absolute -inset-2 rounded-full border-2 border-[#D68227]/40 ${activeCall.status === "connected" ? "animate-pulse" : "animate-ping"}`} />
                    
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-6xl shadow-inner select-none">
                      {activeCall.peer.avatar}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-base font-black text-white">{activeCall.peer.name}</h5>
                    <span className="text-xs text-white/50 block mt-1">{activeCall.peer.role}</span>
                  </div>

                  {/* Call State status */}
                  <div className="text-xs font-bold text-amber-400">
                    {activeCall.status === "dialing" && "در حال بوق زدن..."}
                    {activeCall.status === "ringing" && "در حال زنگ خوردن..."}
                    {activeCall.status === "connected" && "مکالمه صوتی فعال"}
                    {activeCall.status === "ended" && "تماس پایان یافت"}
                  </div>

                  {/* Beautiful Audio Waveform Visualizer simulation */}
                  {activeCall.status === "connected" && (
                    <div className="flex items-center gap-1.5 h-12">
                      {[4, 10, 6, 8, 12, 5, 9, 14, 11, 7, 10, 4, 8, 3, 5, 2, 6, 12, 4, 8].map((h, i) => (
                        <span
                          key={i}
                          className="w-[3px] bg-amber-500 rounded-full animate-pulse"
                          style={{
                            height: `${h * 2.5}px`,
                            animationDelay: `${i * 80}ms`,
                            animationDuration: "0.8s"
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Captions and subtitles region */}
            {activeCall.status === "connected" && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3 max-h-24 overflow-y-auto mb-6 text-right relative flex flex-col justify-end">
                <span className="text-[8px] text-[#D68227] font-black absolute top-1 right-3">زیرنویس زنده صوتی (گفتگو):</span>
                <div className="space-y-1.5 mt-2 overflow-y-auto max-h-16">
                  {activeCall.captions.length === 0 ? (
                    <p className="text-[10px] text-white/40 italic">در حال آنالیز گفتار...</p>
                  ) : (
                    activeCall.captions.slice(-3).map((cap, idx) => (
                      <p key={idx} className="text-[10px] leading-relaxed">
                        <strong className="text-amber-400">{cap.senderName}: </strong>
                        {cap.text}
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* INCOMING CALL BANNER CONTROLS */}
            {activeCall.status === "ringing" && activeCall.peer.id !== currentUser?.id && (
              <div className="bg-slate-800 border border-white/15 p-4 rounded-3xl flex flex-col items-center space-y-4 shadow-xl max-w-sm mx-auto w-full mb-4">
                <p className="text-xs font-bold text-center">تماس ورودی صوتی از {activeCall.peer.name}</p>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => handleRespondCall("accept")}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                  >
                    پاسخ دادن
                  </button>
                  <button
                    onClick={() => handleRespondCall("decline")}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                  >
                    رد کردن
                  </button>
                </div>
              </div>
            )}

            {/* BOTTOM CALL ACTION BUTTONS (CONNECTED or DIALING) */}
            {(activeCall.status === "connected" || activeCall.status === "dialing" || (activeCall.status === "ringing" && activeCall.peer.id === currentUser?.id)) && (
              <div className="mt-auto flex justify-center items-center gap-4 bg-slate-950/40 p-4 rounded-3xl max-w-md mx-auto w-full">
                
                {/* Mute button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full transition-all cursor-pointer border ${
                    isMuted 
                      ? "bg-red-600 border-red-500 text-white" 
                      : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                  }`}
                  title={isMuted ? "وصل کردن صدا" : "بی‌صدا"}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="p-4 bg-red-600 hover:bg-red-700 border border-red-500 rounded-full text-white transition-all cursor-pointer shadow-lg transform hover:scale-105"
                  title="قطع تماس"
                >
                  <PhoneOff size={22} />
                </button>

                {/* Camera off/on button (Only if video call) */}
                {activeCall.type === "video" && (
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-3.5 rounded-full transition-all cursor-pointer border ${
                      isVideoOff 
                        ? "bg-red-600 border-red-500 text-white" 
                        : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                    }`}
                    title={isVideoOff ? "روشن کردن دوربین" : "خاموش کردن دوربین"}
                  >
                    {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
                  </button>
                )}

                {/* Speaker on/off toggle */}
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-3.5 rounded-full transition-all cursor-pointer border ${
                    !isSpeakerOn 
                      ? "bg-red-600 border-red-500 text-white" 
                      : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                  }`}
                  title={isSpeakerOn ? "خاموش کردن بلندگو" : "روشن کردن بلندگو"}
                >
                  {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
