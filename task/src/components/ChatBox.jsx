import { useState, useEffect, useRef, Fragment } from "react";
import socket from "../utils/socket";
import axios from "../utils/axiosInstance";
import { format, isToday, isYesterday } from "date-fns";
import { Paperclip, File as FileIcon, Send, Loader2 } from "lucide-react";

const ChatBox = ({ user, project }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef(null);

  // Generate consistent color for sender
  const getUserColor = (name) => {
    const colors = [
      "text-blue-600",
      "text-green-600",
      "text-purple-600",
      "text-pink-600",
      "text-indigo-600",
      "text-orange-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getDateLabel = (date) => {
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMMM d, yyyy");
  };

  // Fetch messages + join socket room
  useEffect(() => {
    if (!project?._id) return;
    if (!socket.connected) socket.connect();

    const fetchMessages = async () => {
      const res = await axios.get(`/messages/${project._id}`);
      const normalized = res.data
        .map((m) => ({
          ...m,
          senderId: m.senderId?._id || m.senderId,
          senderName: m.senderId?.name || m.senderName || "Unknown",
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(normalized);
    };

    fetchMessages();
    socket.emit("joinProject", project._id);

    socket.on("receiveMessage", (msg) => {
      const formatted = {
        ...msg,
        senderId: msg.senderId?._id || msg.senderId,
        senderName: msg.senderId?.name || msg.senderName || "Unknown",
      };
      if (formatted.projectId === project._id) {
        setMessages((prev) => [...prev, formatted]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [project]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      projectId: project._id,
      senderId: user._id || user.id,
      message: newMessage.trim(),
    };
    socket.emit("sendMessage", msgData);
    setNewMessage("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { fileUrl, fileType, originalName } = res.data;
      socket.emit("sendMessage", {
        projectId: project._id,
        senderId: user._id || user.id,
        fileUrl,
        fileType,
        originalName,
      });
    } catch (err) {
      console.error("File upload failed:", err);
      alert("File upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // Render chat messages
  const renderMessages = () => {
    let lastDate = null;
    return messages.map((msg) => {
      const currentDate = new Date(msg.timestamp).toDateString();
      const showDivider = currentDate !== lastDate;
      lastDate = currentDate;

      const isMine =
        msg.senderId?.toString() === (user._id || user.id)?.toString();
      const senderColor = getUserColor(msg.senderName || "U");
      const senderInitial =
        msg.senderName?.charAt(0).toUpperCase() || "U";

      return (
        <Fragment key={msg._id}>
          {/* Date Divider */}
          {showDivider && (
            <div className="relative flex justify-center items-center my-5">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="relative z-10 bg-white px-3 text-xs font-medium text-gray-600 rounded-full border border-gray-300">
                {getDateLabel(msg.timestamp)}
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          )}

          {/* Message */}
          <div
            className={`flex items-start gap-3 ${isMine ? "justify-end" : "justify-start"
              }`}
          >
            {!isMine && (
              <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-semibold text-sm text-slate-700 mt-1">
                {senderInitial}
              </div>
            )}

            <div
              className={`max-w-[75%] p-3 px-4 shadow-sm rounded-2xl ${isMine
                  ? "bg-blue-600 text-white rounded-tr-lg shadow-md"
                  : "bg-white text-gray-800 rounded-tl-lg border border-gray-100"
                }`}
            >
              <p
                className={`text-sm font-semibold mb-1 ${isMine ? "hidden" : `${senderColor}`
                  }`}
              >
                {msg.senderName}
              </p>

              {msg.fileUrl ? (
                msg.fileType === "image" ? (
                  <img
                    src={msg.fileUrl}
                    alt="Shared"
                    className="rounded-lg max-w-xs mb-1 shadow-sm hover:opacity-90 transition"
                  />
                ) : msg.fileType === "video" ? (
                  <video
                    src={msg.fileUrl}
                    controls
                    className="rounded-lg max-w-xs mb-1"
                  />
                ) : (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-sm underline rounded-lg p-2 ${isMine ? "hover:bg-blue-700" : "hover:bg-gray-100"
                      }`}
                  >
                    <FileIcon size={18} />
                    <span className="truncate">
                      {msg.originalName || "Download File"}
                    </span>
                  </a>
                )
              ) : (
                <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                  {msg.message?.trim()
                    ? msg.message.trim().split(/\s+/).map((word, i) =>
                      word.startsWith("http") ? (
                        <a
                          key={i}
                          href={word}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`underline ${isMine
                              ? "text-blue-200 hover:text-white"
                              : "text-blue-600 hover:text-blue-800"
                            }`}
                        >
                          {word}
                        </a>
                      ) : (
                        " " + word
                      )
                    )
                    : null}
                </p>

              )}

              <span
                className={`text-xs block mt-1.5 opacity-70 ${isMine
                    ? "text-right text-blue-100"
                    : "text-right text-gray-500"
                  }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0">
        <div>
          <h2 className="font-semibold text-lg text-gray-900">{project.name}</h2>
          <p className="text-sm text-gray-500 truncate max-w-sm">
            {project.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 pt-20">No messages yet...</p>
        ) : (
          renderMessages()
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-gray-200 p-4 sm:p-6 flex items-center gap-3"
      >
        <label
          className={`p-3 rounded-lg transition-colors ${uploading
              ? "opacity-50 cursor-not-allowed bg-gray-100"
              : "text-gray-500 hover:text-blue-600 hover:bg-gray-100 cursor-pointer"
            }`}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Paperclip size={20} />
          )}
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.zip"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        <input
          type="text"
          placeholder={
            uploading ? "Uploading file..." : "Type your message..."
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={uploading}
          className="flex-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={uploading || !newMessage.trim()}
          className="flex-shrink-0 flex justify-center items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
