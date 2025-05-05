import { useEffect, useRef, useState } from "react";
import styles from "./chat.module.css";
import { MdOutlineLightbulb } from "react-icons/md";
import { sendMessageToAI } from "../../services/chat";
import { extractContent } from "../../context/extractContent";
import { TiWarning } from "react-icons/ti";
import FinalIdeaForm from "../FinalIdeaForm/FinalIdeaForm";

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
  sessionId,
  onWarning = () => { },
  onIdeaOpen = () => { },
}) => {
  const chatContainerRef = useRef(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const spinnerTimerRef = useRef(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 1200);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth <= 1200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // useEffect(() => {
  //   if (!sessionId) return;

  //   const storedHistory = localStorage.getItem(`conversation_${sessionId}`);

  //   if (storedHistory) {
  //     try {
  //       try {
  //         const history = JSON.parse(storedHistory);
  //         const filteredHistory = [];

  //         for (let i = 0; i < history.length; i++) {
  //           const current = history[i];
  //           const next = history[i + 1];

  //           if (
  //             current.role === "user" &&
  //             next &&
  //             next.role === "assistant"
  //           ) {
  //             filteredHistory.push(current, next);
  //             i++;
  //           }
  //         }

  //         setConversationHistory(filteredHistory);
  //       } catch (err) {
  //         console.error("Erreur lors du parsing de l'historique:", err);
  //       }

  //     } catch (err) {
  //       console.error("Erreur lors du parsing de l'historique:", err);
  //     }
  //   }
  // }, []);

  useEffect(() => {
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
      const newHistory = alreadyExists
        ? [...prev, assistantPlaceholder]
        : [...prev, userMsgWithId, assistantPlaceholder];
      return [...newHistory];
    });

    setIsStreaming(true);

    clearTimeout(spinnerTimerRef.current);
    spinnerTimerRef.current = setTimeout(() => {
      setShowSpinner(true);
    }, 3000);

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

        onWarning(); setConversationHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: (
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <TiWarning className={styles.warningIcon} />
                Oups, une erreur est survenue. Essaie plus tard (problème serveur ou connexion).
              </span>), id: crypto.randomUUID(),
            date: new Date(),
            isWarning: true,
          },
        ]);
      })
      .finally(() => {
        setIsStreaming(false);
        setShowSpinner(false);
        clearTimeout(spinnerTimerRef.current);
      });
  }, [messages]);

  const processedMessages = messages.map((msg) => {
    if (msg.role === "assistant" && msg.content) {
      const { answer, sources } = extractContent(msg.content);
      return { ...msg, content: answer || msg.content, sources };
    }
    return msg;
  });
  // const mergedMessages = mergeMessages(processedMessages, conversationHistory);
  const mergedMessages = conversationHistory.length > 0
    ? mergeMessages(processedMessages, conversationHistory)
    : processedMessages;

  const handleIgotMyIdea = () => {
    setShowIdeaModal(true);
    onIdeaOpen(true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRight}>
        {!showIdeaModal && (
          <button className={styles.submitButton} onClick={handleIgotMyIdea}>
            <MdOutlineLightbulb className={styles.submitIcon} size={22} />
            <span className={styles.submitLabel}>Submit</span>
          </button>
        )}
      </div>


      <div className={styles.layout}>
        <div className={`${styles.centeredCont} ${showIdeaModal ? styles.shiftedLeft : styles.centered}`}>
          <div
            ref={chatContainerRef}
            className={`${styles.chatContainer} ${className} ${showIdeaModal ? styles.chatWithPadding : ""}`}
            style={style}
          >
            {mergedMessages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className={styles.clientMessage}>
                    <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                  </div>
                );
              } else if (msg.role === "assistant") {
                const content = (
                  <div
                    key={msg.id}
                    className={
                      msg.isWarning ? styles.warningMessage : styles.machineResponse
                    }
                  >
                    {typeof msg.content === "string" ? (
                      <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                    ) : (
                      msg.content
                    )}
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

                return msg._streaming ? (
                  <div key={msg.id} className={styles.machineResponse}>
                    <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                  </div>
                ) : content;
              }

              return null;
            })}
          </div>
        </div>

        {showIdeaModal && (
          isMobileOrTablet ? (
            <div className={styles.fullscreenOverlay}>
              <FinalIdeaForm onClose={() => {
                setShowIdeaModal(false);
                onIdeaOpen(false);
              }} />
            </div>
          ) : (
            <div className={styles.rightPanel}>
              <FinalIdeaForm onClose={() => {
                setShowIdeaModal(false);
                onIdeaOpen(false);
              }} />
            </div>
          )
        )}


      </div>
    </div>
  );
};

export default ChatWidget;
