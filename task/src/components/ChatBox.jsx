import { useState, useEffect, useRef, Fragment } from "react";
import socket from "../utils/socket";
import axios from "../utils/axiosInstance";
import { format, isToday, isYesterday } from "date-fns";
import { Paperclip, File as FileIcon } from "lucide-react";

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

  // Fetch + socket join
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
            <div className="flex justify-center items-center my-3">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs shadow-md">
                {getDateLabel(msg.timestamp)}
              </span>
            </div>
          )}

          {/* Message */}
          <div
            className={`flex items-start gap-2 mb-4 ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar (top-left aligned) */}
            {!isMine && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-sm text-gray-700 mt-1">
                {senderInitial}
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[75%] p-3 shadow-md rounded-lg ${
                isMine
                  ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-tr-none"
                  : "bg-white text-gray-800 rounded-tl-none"
              }`}
            >
              <p
                className={`text-xs font-semibold mb-1 ${
                  isMine ? "text-gray-200 text-right" : `${senderColor}`
                }`}
              >
                {isMine ? "You" : msg.senderName}
              </p>

              {msg.fileUrl ? (
                msg.fileType === "image" ? (
                  <img
                    src={msg.fileUrl}
                    alt="Shared"
                    className="rounded-md max-w-xs mb-2 shadow-sm hover:opacity-90 transition"
                  />
                ) : msg.fileType === "video" ? (
                  <video
                    src={msg.fileUrl}
                    controls
                    className="rounded-md max-w-xs mb-2"
                  />
                ) : (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm underline hover:text-blue-400"
                  >
                    <FileIcon size={16} />
                    {msg.originalName || "Download File"}
                  </a>
                )
              ) : (
                <p className="whitespace-pre-wrap break-words leading-snug">
                  {msg.message.split(" ").map((word, i) =>
                    word.startsWith("http") ? (
                      <a
                        key={i}
                        href={word}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline ${
                          isMine ? "text-yellow-200" : "text-blue-600"
                        }`}
                      >
                        {word}
                      </a>
                    ) : (
                      " " + word
                    )
                  )}
                </p>
              )}

              <span
                className={`text-[10px] block mt-1 opacity-70 ${
                  isMine
                    ? "text-right text-gray-200"
                    : "text-right text-gray-500"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Avatar space for sender (to align right messages properly) */}
            {isMine && <div className="w-8"></div>}
          </div>
        </Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col h-full rounded-lg border shadow-md bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-4 text-white shadow flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg">{project.name}</h2>
          <p className="text-sm opacity-80">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs opacity-80">Active</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">
            No messages yet...
          </p>
        ) : (
          renderMessages()
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="backdrop-blur-md bg-white/90 border-t p-3 flex items-center gap-3 sticky bottom-0"
      >
        <label
          className={`cursor-pointer text-gray-600 hover:text-blue-600 ${
            uploading && "opacity-50 cursor-not-allowed"
          }`}
        >
          <Paperclip size={20} />
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
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
        />

        <button
          type="submit"
          disabled={uploading}
          className={`px-4 py-2 rounded-md text-white font-medium shadow-md transition ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
