import React, { useState, useRef, useCallback, useEffect } from "react";

// Mock data for received messages
const initialReceivedMessages = [
  { id: 1, from: "Sarah (Wife)", message: "Hope you're doing great up there! The kids miss you and we're so proud of you! 🌟", timestamp: "2 hours ago", urgent: false },
  { id: 2, from: "Tom (Son)", message: "Dad, I got an A on my science project about rockets! 🚀", timestamp: "5 hours ago", urgent: false },
  { id: 3, from: "Mission Control", message: "Family video message uploaded for you. Priority: High", timestamp: "1 day ago", urgent: true },
  { id: 4, from: "Dr. Sharma", message: "Important: Weekly health checkup scheduled for tomorrow. Please complete pre-check questionnaire.", timestamp: "3 hours ago", urgent: true },
  { id: 5, from: "Mom", message: "Just wanted to say hello and see how you're doing! ❤️", timestamp: "6 hours ago", urgent: false },
];

// IndexedDB for offline storage
const DB_NAME = "AstroCompanionDB";
const DB_VERSION = 1;
const STORE_MESSAGES = "messages";
const STORE_MEDIA = "media";

export default function FamilyPage() {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState(initialReceivedMessages);
  const [outboxMessages, setOutboxMessages] = useState<any[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video" | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video" | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "checking">("checking");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dbRef = useRef<IDBDatabase | null>(null);

  // Sort messages with urgent ones at the top
  const sortedReceivedMessages = React.useMemo(() => {
    return [...receivedMessages].sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [receivedMessages]);

  // Count urgent messages
  const urgentMessageCount = React.useMemo(() => {
    return receivedMessages.filter(msg => msg.urgent).length;
  }, [receivedMessages]);

  // Initialize IndexedDB for offline storage
  useEffect(() => {
    const initDB = async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          dbRef.current = request.result;
          resolve(request.result);
        };
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
            const messageStore = db.createObjectStore(STORE_MESSAGES, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            messageStore.createIndex('timestamp', 'timestamp', { unique: false });
            messageStore.createIndex('status', 'status', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_MEDIA)) {
            const mediaStore = db.createObjectStore(STORE_MEDIA, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            mediaStore.createIndex('messageId', 'messageId', { unique: false });
          }
        };
      });
    };

    initDB().then(() => {
      loadStoredMessages();
      simulateConnectionCheck();
    }).catch(console.error);
  }, []);

  // Simulate space communication delays and outages
  const simulateConnectionCheck = () => {
    const isConnected = Math.random() > 0.3;
    setConnectionStatus(isConnected ? "online" : "offline");
    if (isConnected) {
      setTimeout(() => {
        processOutbox();
      }, 2000);
    }
  };

  // Load messages from offline storage
  const loadStoredMessages = async () => {
    if (!dbRef.current) return;
    const transaction = dbRef.current.transaction([STORE_MESSAGES], "readonly");
    const store = transaction.objectStore(STORE_MESSAGES);
    const request = store.getAll();
    request.onsuccess = () => {
      const messages = request.result;
      const outbox = messages.filter((msg: any) => msg.direction === "sent" && msg.status === "queued");
      setOutboxMessages(outbox);
    };
  };

  // Save message to offline storage
  const saveMessageToDB = async (messageData: any): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        reject(new Error("Database not initialized"));
        return;
      }
      const transaction = dbRef.current.transaction([STORE_MESSAGES], "readwrite");
      const store = transaction.objectStore(STORE_MESSAGES);
      const request = store.add({
        ...messageData,
        timestamp: new Date().toISOString(),
        status: "queued"
      });
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  };

  // Save media to offline storage
  const saveMediaToDB = async (mediaData: string, messageId: number, type: "photo" | "video") => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        reject(new Error("Database not initialized"));
        return;
      }
      const transaction = dbRef.current.transaction([STORE_MEDIA], "readwrite");
      const store = transaction.objectStore(STORE_MEDIA);
      const request = store.add({
        messageId,
        data: mediaData,
        type,
        timestamp: new Date().toISOString()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  // Delete message from database
  const deleteMessageFromDB = async (messageId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        reject(new Error("Database not initialized"));
        return;
      }
      const transaction = dbRef.current.transaction([STORE_MESSAGES, STORE_MEDIA], "readwrite");
      const messageStore = transaction.objectStore(STORE_MESSAGES);
      const mediaStore = transaction.objectStore(STORE_MEDIA);
      const messageRequest = messageStore.delete(messageId);
      const mediaIndex = mediaStore.index('messageId');
      const mediaRequest = mediaIndex.openCursor(IDBKeyRange.only(messageId));
      mediaRequest.onsuccess = () => {
        const cursor = mediaRequest.result;
        if (cursor) {
          mediaStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
      messageRequest.onsuccess = () => resolve();
      messageRequest.onerror = () => reject(messageRequest.error);
    });
  };

  // Delete message from outbox
  const deleteOutboxMessage = async (messageId: number) => {
    try {
      await deleteMessageFromDB(messageId);
      setOutboxMessages(prev => prev.filter(msg => msg.id !== messageId));
      alert("Message deleted from outbox");
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Error deleting message. Please try again.");
    }
  };

  // Process queued messages when connection available
  const processOutbox = async () => {
    if (outboxMessages.length === 0 || connectionStatus !== "online") return;
    for (const message of outboxMessages) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (dbRef.current) {
          const transaction = dbRef.current.transaction([STORE_MESSAGES], "readwrite");
          const store = transaction.objectStore(STORE_MESSAGES);
          store.put({ ...message, status: "sent" });
        }
        setOutboxMessages(prev => prev.filter(msg => msg.id !== message.id));
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  // Enhanced camera functions with offline capability
  const startCamera = useCallback(async (mode: "photo" | "video") => {
    try {
      setCameraMode(mode);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: "user" 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setCapturedMedia(null);
        setMediaType(null);
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Camera access denied. Please allow camera permissions and refresh the page.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsRecording(false);
    setCameraMode(null);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && cameraMode === "photo") {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedMedia(imageDataUrl);
        setMediaType("photo");
        stopCamera();
      }
    }
  }, [stopCamera, cameraMode]);

  // Start video recording
  const startRecording = useCallback(() => {
    if (streamRef.current && cameraMode === "video") {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedMedia(videoUrl);
        setMediaType("video");
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    }
  }, [cameraMode]);

  // Stop video recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && cameraMode === "video") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    }
  }, [isRecording, stopCamera, cameraMode]);

  // OFFLINE-FIRST Send function
  const sendToFamily = async () => {
    if (!message.trim() && !capturedMedia) return;
    try {
      const messageData = {
        direction: "sent",
        from: "You",
        message: message || `Sent a ${mediaType} to family`,
        mediaType: mediaType,
        urgent: false
      };
      const messageId = await saveMessageToDB(messageData);
      if (capturedMedia && mediaType) {
        await saveMediaToDB(capturedMedia, messageId, mediaType);
      }
      setOutboxMessages(prev => [...prev, { ...messageData, id: messageId, timestamp: new Date().toISOString() }]);
      if (connectionStatus === "online") {
        alert(`${mediaType ? mediaType.charAt(0).toUpperCase() + mediaType.slice(1) : "Message"} queued for transmission!`);
        processOutbox();
      } else {
        alert(`${mediaType ? mediaType.charAt(0).toUpperCase() + mediaType.slice(1) : "Message"} stored offline. Will transmit when connection resumes.`);
      }
      setMessage("");
      setCapturedMedia(null);
      setMediaType(null);
    } catch (error) {
      console.error("Failed to save message:", error);
      alert("Error saving message. Please try again.");
    }
  };

  // Simulate receiving messages
  const simulateReceiveMessage = () => {
    const newMessage = {
      id: Date.now(),
      direction: "received",
      from: "Mission Control",
      message: "Test message received. Communication system working.",
      timestamp: new Date().toISOString(),
      urgent: false
    };
    setReceivedMessages(prev => [newMessage, ...prev]);
  };

  const markAsRead = (id: number) => {
    setReceivedMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <div className="p-6 min-h-screen bg-space-deep text-cosmic-white">
      <div className="max-w-6xl mx-auto">
        {/* Header with Connection Status */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Family Communication</h1>
          <p className="text-cosmic-gray">Offline-First Space Communication System</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              connectionStatus === "online" ? "bg-green-500" : 
              connectionStatus === "offline" ? "bg-red-500" : "bg-yellow-500"
            }`}></div>
            <span className={`text-sm font-semibold ${
              connectionStatus === "online" ? "text-teal-bright" : 
              connectionStatus === "offline" ? "text-red-400" : "text-yellow-400"
            }`}>
              {connectionStatus === "online" ? "🛰️ Space-to-Ground: ONLINE" :
               connectionStatus === "offline" ? "📡 Space-to-Ground: OFFLINE" :
               "🔍 Checking Connection..."}
            </span>
          </div>
          {outboxMessages.length > 0 && (
            <div className="mt-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 inline-block">
              <span className="text-yellow-300 text-sm">
                📬 {outboxMessages.length} message(s) queued for transmission
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Send to Family */}
          <div className="space-y-6">
            <div className="bg-space-medium rounded-xl p-6 border border-teal-soft/20">
              <h2 className="text-xl font-semibold mb-4 text-teal-bright">
                Send to Family on Earth
                {connectionStatus === "offline" && (
                  <span className="ml-2 text-sm text-yellow-400">(Offline Mode)</span>
                )}
              </h2>
              
              {/* Text Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-cosmic-gray">
                  Message to Family
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your experiences in space... (Works offline)"
                  className="w-full h-32 p-4 bg-space-light rounded-lg border border-input text-cosmic-white placeholder:text-cosmic-gray focus:outline-none focus:ring-2 focus:ring-teal-bright"
                />
              </div>

              {/* Media Capture */}
              <div className="space-y-4">
                <h3 className="font-semibold text-cosmic-gray">
                  Add Photo or Video {connectionStatus === "offline" && "(Stored Locally)"}
                </h3>
                
                {/* Camera Selection Buttons - Show when camera is NOT active */}
                {!cameraActive && !capturedMedia && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => startCamera("photo")}
                      className="flex-1 px-4 py-6 bg-teal-bright/20 text-teal-bright rounded-lg hover:bg-teal-bright/30 transition border-2 border-teal-soft/50 flex flex-col items-center justify-center"
                    >
                      <span className="text-3xl mb-2">📸</span>
                      <span className="text-lg font-semibold">Take Photo</span>
                      <span className="text-xs text-cosmic-gray mt-1">Capture a photo to send</span>
                    </button>
                    <button
                      onClick={() => startCamera("video")}
                      className="flex-1 px-4 py-6 bg-violet-bright/20 text-violet-bright rounded-lg hover:bg-violet-bright/30 transition border-2 border-violet-soft/50 flex flex-col items-center justify-center"
                    >
                      <span className="text-3xl mb-2">🎥</span>
                      <span className="text-lg font-semibold">Record Video</span>
                      <span className="text-xs text-cosmic-gray mt-1">Record a video message</span>
                    </button>
                  </div>
                )}

                {/* Camera Interface - Show when camera IS active */}
                {cameraActive && (
                  <div className="space-y-4 p-4 bg-space-light rounded-lg border-2 border-teal-soft">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-teal-bright">
                        {cameraMode === "photo" ? "📸 Photo Mode" : "🎥 Video Mode"}
                      </h4>
                      <p className="text-sm text-cosmic-gray">
                        {cameraMode === "photo" 
                          ? "Position yourself and click the capture button below" 
                          : isRecording 
                            ? "Recording... Click stop when finished" 
                            : "Click start to begin recording"}
                      </p>
                    </div>

                    {/* Camera Feed */}
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                      />
                      {/* Recording Indicator for Video Mode */}
                      {cameraMode === "video" && isRecording && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-full animate-pulse flex items-center space-x-2">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <span className="text-sm font-bold">RECORDING</span>
                        </div>
                      )}
                    </div>

                    {/* Camera Controls */}
                    <div className="flex flex-col space-y-3">
                      {/* Photo Mode Controls */}
                      {cameraMode === "photo" && (
                        <div className="flex space-x-3 justify-center">
                          <button
                            onClick={capturePhoto}
                            className="px-8 py-4 bg-teal-bright text-white rounded-lg hover:bg-teal-bright/80 transition font-bold text-lg flex items-center space-x-3 shadow-lg"
                          >
                            <span className="text-2xl">📸</span>
                            <span>CAPTURE PHOTO</span>
                          </button>
                        </div>
                      )}

                      {/* Video Mode Controls */}
                      {cameraMode === "video" && (
                        <div className="flex space-x-3 justify-center">
                          {!isRecording ? (
                            <button
                              onClick={startRecording}
                              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-lg flex items-center space-x-3 shadow-lg"
                            >
                              <span className="text-2xl">⏺️</span>
                              <span>START RECORDING</span>
                            </button>
                          ) : (
                            <button
                              onClick={stopRecording}
                              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-lg flex items-center space-x-3 shadow-lg animate-pulse"
                            >
                              <span className="text-2xl">⏹️</span>
                              <span>STOP RECORDING</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Cancel Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={stopCamera}
                          className="px-6 py-3 bg-destructive text-white rounded-lg hover:bg-destructive/80 transition font-semibold flex items-center space-x-2"
                        >
                          <span>❌</span>
                          <span>Cancel Camera</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Preview - Show after capture/recording */}
                {capturedMedia && (
                  <div className="space-y-4 p-4 bg-space-light rounded-lg border-2 border-teal-soft">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold text-teal-bright">
                        {mediaType === "photo" ? "📸 Photo Ready!" : "🎥 Video Ready!"}
                      </p>
                      <button
                        onClick={() => {
                          setCapturedMedia(null);
                          setMediaType(null);
                        }}
                        className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/80 transition text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {mediaType === "photo" ? (
                      <div className="text-center">
                        <img 
                          src={capturedMedia} 
                          alt="Captured" 
                          className="rounded-lg border-2 border-teal-soft max-w-full max-h-64 mx-auto"
                        />
                        <p className="text-cosmic-gray text-sm mt-2">Preview of your photo</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <video 
                          src={capturedMedia} 
                          controls 
                          className="rounded-lg border-2 border-teal-soft max-w-full max-h-64 mx-auto"
                        />
                        <p className="text-cosmic-gray text-sm mt-2">Preview your video before sending</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={sendToFamily}
                disabled={!message.trim() && !capturedMedia}
                className="w-full mt-6 px-6 py-4 bg-teal-bright text-white rounded-lg hover:bg-teal-bright/80 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg"
              >
                {connectionStatus === "online" ? "🚀 TRANSMIT TO EARTH" : "💾 STORE OFFLINE"}
              </button>

              {/* Debug Controls */}
              <div className="mt-4 p-4 bg-space-light rounded-lg border border-cosmic-gray/20">
                <h4 className="text-sm font-semibold text-cosmic-gray mb-2">Debug Controls</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setConnectionStatus("online")}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm"
                  >
                    Simulate Online
                  </button>
                  <button
                    onClick={() => setConnectionStatus("offline")}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm"
                  >
                    Simulate Offline
                  </button>
                  <button
                    onClick={simulateReceiveMessage}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm"
                  >
                    Simulate Receive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Messages */}
          <div className="space-y-6">
            {/* Outbox Messages */}
            {outboxMessages.length > 0 && (
              <div className="bg-space-medium rounded-xl p-6 border border-yellow-500/20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-yellow-400">
                    📬 Outbox ({outboxMessages.length})
                  </h2>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete all queued messages?")) {
                        outboxMessages.forEach(msg => deleteOutboxMessage(msg.id));
                      }
                    }}
                    className="text-xs bg-red-600/20 text-red-300 px-2 py-1 rounded hover:bg-red-600/30 transition"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {outboxMessages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-yellow-300">You → Earth</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-yellow-400">Queued</span>
                          <button
                            onClick={() => deleteOutboxMessage(msg.id)}
                            className="text-red-400 hover:text-red-300 transition text-xs"
                            title="Delete message"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-yellow-200 text-sm">{msg.message}</p>
                      {msg.mediaType && (
                        <span className="inline-block mt-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                          📎 {msg.mediaType}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Received Messages */}
            <div className="bg-space-medium rounded-xl p-6 border border-violet-soft/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-violet-bright">
                  Messages from Earth ({receivedMessages.length})
                </h2>
                {urgentMessageCount > 0 && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
                    <span className="text-red-300 text-sm font-semibold">
                      🔥 {urgentMessageCount} Priority
                    </span>
                  </div>
                )}
              </div>
              
              {receivedMessages.length === 0 ? (
                <div className="text-center py-8 text-cosmic-gray">
                  <div className="text-4xl mb-2">🌍</div>
                  <p>No messages received</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sortedReceivedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg border ${
                        msg.urgent 
                          ? 'bg-red-500/10 border-red-500/30 ring-2 ring-red-500/20' 
                          : 'bg-space-light border-violet-soft/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-teal-bright">{msg.from}</span>
                          {msg.urgent && (
                            <span className="inline-block px-2 py-1 bg-red-500 text-white rounded text-xs font-bold">
                              🔥 PRIORITY
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-cosmic-gray">{msg.timestamp}</span>
                      </div>
                      <p className="text-cosmic-white mb-3">{msg.message}</p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="text-xs text-violet-bright hover:text-violet-soft transition"
                        >
                          Mark as Read
                        </button>
                        {msg.urgent && (
                          <span className="text-xs text-red-300">
                            ⚠️ Requires Attention
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Status */}
            <div className="bg-space-medium rounded-xl p-4 border border-cosmic-gray/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}></div>
                  <span className="text-sm">
                    {connectionStatus === "online" ? "Real-time transmission" : "Local storage active"}
                  </span>
                </div>
                <span className="text-xs text-cosmic-gray">
                  {urgentMessageCount > 0 ? `${urgentMessageCount} priority messages` : 'All messages read'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}