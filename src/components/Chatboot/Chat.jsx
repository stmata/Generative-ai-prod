import React, { useEffect, useRef, useState } from "react";
import styles from "./chat.module.css";
import headerImage from "../../assets/images/Logo-SKEMA-Noir.png";
import { MdOutlineLightbulb } from "react-icons/md";
import { sendMessageToAI } from "../../services/chat";
import IdeaModal from "../IdeaModal/IdeaModal";


function deduplicateMessages(combinedArray) {
  const unique = [];
  for (const msg of combinedArray) {
    const alreadyExists = unique.some(
      (m) => m.role === msg.role && m.content === msg.content
    );
    if (!alreadyExists) {
      unique.push(msg);
    }
  }
  return unique;
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


  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "user") return;

    const isDuplicate = conversationHistory.some(
      (m) => m.role === "user" && m.content === lastMsg.content
    );
    if (isDuplicate) return;

    setConversationHistory((prev) => [
      ...prev,
      { ...lastMsg, date: new Date() }
    ]);

    const assistantPlaceholder = {
      role: "assistant",
      content: "",
      date: new Date(),
      _streaming: true,
    };
    setConversationHistory((prev) => [...prev, assistantPlaceholder]);

    setIsStreaming(true);
    sendMessageToAI(
      lastMsg.content,
      (chunk, partialAnswer, partialSources) => {
        setConversationHistory((prev) => {
          const updated = [...prev];
          const placeholderIndex = updated.findIndex(
            (m) => m.role === "assistant" && m._streaming
          );
          if (placeholderIndex === -1) return updated;

          updated[placeholderIndex] = {
            ...updated[placeholderIndex],
            content: partialAnswer,
          };
          return updated;
        });
      },
      conversationHistory
    )
      .then(([finalAnswer, finalSources]) => {
        setConversationHistory((prev) => {
          const updated = [...prev];
          const placeholderIndex = updated.findIndex(
            (m) => m.role === "assistant" && m._streaming
          );
          if (placeholderIndex === -1) return updated;

          const contentAsJsonString = JSON.stringify({
            answer: finalAnswer,
            sources: finalSources,
          });

          updated[placeholderIndex] = {
            role: "assistant",
            content: contentAsJsonString,
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
  }, [messages, conversationHistory]);

  const mergedMessages = deduplicateMessages([
    ...messages.map((m) => {
      return {
        ...m,
        date: m.date ? new Date(m.date) : new Date(),
      };
    }),
    ...conversationHistory,
  ]);

  mergedMessages.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!sessionExists) {
    return (
      <div className={styles.chatContainer} style={style}>
        <div className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <img src={headerImage} alt="Logo" className={styles.headerImage} />
          </div>
        </div>
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
    <div
      ref={chatContainerRef}
      className={`${styles.chatContainer} ${className}`}
      style={style}
    >
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <img src={headerImage} alt="Logo" className={styles.headerImage} />
        </div>
        <div className={styles.headerRight}>
          <button className={styles.shareButton} onClick={handleIgotMyIdea}>
            <MdOutlineLightbulb
              className={styles.shareIcon}
              style={{ marginRight: "13px" }}
              size={20}
            />
            I got my idea
          </button>
        </div>
      </div>

      {mergedMessages.map((msg, i) => {
        if (msg.role === "user") {
          return (
            <div key={i} className={styles.clientMessage}>
              <p>{msg.content}</p>
            </div>
          );
        } else if (msg.role === "assistant") {
          const isStillStreaming = msg._streaming === true;
          if (isStillStreaming) {
            return (
              <div key={i} className={styles.machineResponse}>
                <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
              </div>
            );
          } else {
            let displayedText = msg.content;
            let displayedSources = "";

            try {
              const parsed = JSON.parse(msg.content);
              if (parsed.answer) displayedText = parsed.answer;
              if (parsed.sources) displayedSources = parsed.sources;
            } catch (err) {
              // Si ce n’est pas du JSON valide, on l’affiche tel quel
            }

            return (
              <div key={i} className={styles.machineResponse}>
                <p style={{ whiteSpace: "pre-line" }}>{displayedText}</p>
                {displayedSources &&
                  displayedSources.trim() !== "" &&
                  displayedSources.trim().toUpperCase() !== "N/A" && (
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
                      {displayedSources}
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
  );
};

export default ChatWidget;
