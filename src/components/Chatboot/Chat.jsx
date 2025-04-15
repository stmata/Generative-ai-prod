import React, { useEffect, useRef, useState } from "react";
import styles from "./chat.module.css";
import { MdOutlineLightbulb } from "react-icons/md";
import { sendMessageToAI } from "../../services/chat";
import IdeaModal from "../IdeaModal/IdeaModal";
import { extractContent } from "../../context/extractContent";

function mergeMessages(messagesA, messagesB) {
  const all = [...messagesA, ...messagesB];
  const seen = new Set();
  const result = [];
  for (const msg of all) {
    if (!msg.id) {
      msg.id = crypto.randomUUID();
    }
    if (!seen.has(msg.id)) {
      seen.add(msg.id);
      result.push(msg);
    }
  }
  result.sort((a, b) => new Date(a.date) - new Date(b.date));
  return result;
}

const ChatWidget = ({
  messages = [],
  className,
  style,
  onStreamingChange = () => { },
}) => {
  const chatContainerRef = useRef(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionExists, setSessionExists] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      setSessionExists(true);
      const storedHistory = localStorage.getItem(`conversation_${sessionId}`);
      if (storedHistory) {
        try {
          setConversationHistory(JSON.parse(storedHistory));
        } catch (err) {
          console.error("Erreur lors du parsing de l'historique:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      localStorage.setItem(
        `conversation_${sessionId}`,
        JSON.stringify(conversationHistory)
      );
    }
  }, [conversationHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, conversationHistory]);

  useEffect(() => {
    onStreamingChange(isStreaming);
  }, [isStreaming, onStreamingChange]);

  const lastProcessedUserRef = useRef(null);
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "user") return;
    if (lastProcessedUserRef.current === lastMsg.id) return;
    lastProcessedUserRef.current = lastMsg.id;

    const userMsgWithId = {
      ...lastMsg,
      id: lastMsg.id || crypto.randomUUID(),
      date: new Date(),
    };

    const updatedConversation = [...conversationHistory, userMsgWithId];

    const assistantPlaceholder = {
      role: "assistant",
      content: "",
      id: crypto.randomUUID(),
      date: new Date(),
      _streaming: true,
    };

    setConversationHistory((prev) => {
      const alreadyExists = prev.find((m) => m.id === userMsgWithId.id);
      const newHistory = alreadyExists ? [...prev, assistantPlaceholder] : [...prev, userMsgWithId, assistantPlaceholder];
      return [...newHistory];
    });

    setIsStreaming(true);

    sendMessageToAI(
      userMsgWithId.content,
      (chunk, partialAnswer, partialSources) => {
        setConversationHistory((prev) => {
          const updated = [...prev];
          let placeholderIndex = updated.findIndex(
            (m) => m.role === "assistant" && m._streaming
          );
          if (placeholderIndex === -1) {
            const newPlaceholder = {
              role: "assistant",
              content: partialAnswer,
              _streaming: true,
              id: crypto.randomUUID(),
              date: new Date(),
            };
            return [...updated, newPlaceholder];
          }
          updated[placeholderIndex] = {
            ...updated[placeholderIndex],
            content: partialAnswer,
          };
          return updated;
        });

      },
      updatedConversation
    )
      .then(([finalAnswer, finalSources]) => {
        setConversationHistory((prev) => {
          const updated = [...prev];
          const placeholderIndex = updated.findIndex(
            (m) => m.role === "assistant" && m._streaming
          );
          if (placeholderIndex === -1) return updated;
          updated[placeholderIndex] = {
            role: "assistant",
            content: finalAnswer,
            sources: finalSources,
            id: crypto.randomUUID(),
            date: new Date(),
          };
          return updated;
        });
      })
      .catch((err) => {
        console.error("Erreur lors du streaming:", err);
      })
      .finally(() => {
        setIsStreaming(false);
      });
  }, [messages]);

  const processedMessages = messages.map((msg) => {
    if (msg.role === "assistant" && msg.content) {
      const { answer, sources } = extractContent(msg.content);
      return { ...msg, content: answer || msg.content, sources };
    }
    return msg;
  });
  const mergedMessages = mergeMessages(processedMessages, conversationHistory);

  if (!sessionExists) {
    return (
      <div className={styles.chatContainer} style={style}>
        <p style={{ textAlign: "center", padding: "1rem" }}>
          Aucune session trouvée. Veuillez créer ou démarrer une session avant de discuter.
        </p>
      </div>
    );
  }

  const handleIgotMyIdea = () => {
    setShowIdeaModal(true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRight}>
        <button className={styles.shareButton} onClick={handleIgotMyIdea}>
          <MdOutlineLightbulb
            className={styles.shareIcon}
            style={{ marginRight: "13px" }}
            size={35}
          />
        </button>
      </div>
      <div className={styles.centeredCont}>
        <div
          ref={chatContainerRef}
          className={`${styles.chatContainer} ${className}`}
          style={style}
        >
          {mergedMessages.map((msg, i) => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className={styles.clientMessage}>
                  <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                </div>
              );
            }
            else if (msg.role === "assistant") {
              if (msg._streaming) {
                return (
                  <div key={msg.id} className={styles.machineResponse}>
                    <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                  </div>
                );
              } else {
                return (
                  <div key={msg.id} className={styles.machineResponse}>
                    <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                    {msg.sources && msg.sources.trim() !== "" && (
                      <p
                        style={{
                          marginTop: "1rem",
                          fontStyle: "italic",
                          color: "#BF0030",
                          whiteSpace: "pre-line",
                        }}
                      >
                        Sources:
                        {"\n"}
                        {msg.sources}
                      </p>
                    )}
                  </div>
                );
              }
            }
            return null;
          })}
          {showIdeaModal && <IdeaModal onClose={() => setShowIdeaModal(false)} />}
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
