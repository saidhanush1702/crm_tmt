import { useState, useEffect, useRef } from "react";
import socket from "../utils/socket";
import axios from "../utils/axiosInstance";

const ChatBox = ({ user, project }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!project?._id) return;

    const fetchMessages = async () => {
      const res = await axios.get(`/messages/${project._id}`);
      setMessages(res.data);
    };

    fetchMessages();
    socket.emit("joinProject", project._id);

    socket.on("receiveMessage", (msg) => {
      if (msg.projectId === project._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [project]);

  // Auto-scroll to bottom when new messages come
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      projectId: project._id,
      senderId: user.id,
      message: newMessage.trim(),
    };

    socket.emit("sendMessage", msgData);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-3 shadow-sm">
        <h2 className="font-bold text-lg text-gray-800">{project.name}</h2>
        <p className="text-sm text-gray-600">{project.description}</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">No messages yet...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 rounded-md max-w-xl wrap-break-word ${
                msg.senderId === user.id
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">
                {msg.message.split(" ").map((word, i) =>
                  word.startsWith("http") ? (
                    <a
                      key={i}
                      href={word}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-yellow-200"
                    >
                      {word}
                    </a>
                  ) : (
                    " " + word
                  )
                )}
              </p>
              <span className="text-xs block text-right opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t p-3 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
