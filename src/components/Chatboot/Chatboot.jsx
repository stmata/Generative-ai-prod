import React, { useState, useRef, useEffect } from 'react';
import ChatWidget from './Chat';
import styles from './Chatboot.module.css';
import { AiOutlineSend } from 'react-icons/ai';
import { getConversation } from '../../services/getConversation';
import { LuMailWarning } from 'react-icons/lu';

const Chatboot = () => {
  const [messageValue, setMessageValue] = useState(10);
  const MAX_MESSAGES = messageValue;

  const [conversations, setConversations] = useState([
    { id: 1, name: 'New Chat 1', messages: [], date: new Date() }
  ]);
  const [activeConversationId, setActiveConversationId] = useState(1);

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const [loadingServer, setLoadingServer] = useState(true);
  const [disableInput, setDisableInput] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('session_id', sessionId);
        console.log(sessionId);
      }
    }
  }, []);

  useEffect(() => {
    const fetchServerConversation = async () => {
      try {
        const { conversation_history, message_value } = await getConversation();
        if (conversation_history?.length) {
          const transformed = conversation_history.map(msg => ({
            role: msg.role,
            content: msg.content,
            date: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          setConversations([{
            id: 1,
            name: 'Server Chat',
            messages: transformed,
            date: new Date()
          }]);
          setActiveConversationId(1);
        }
        if (typeof message_value === 'number') {
          setMessageValue(message_value);
        }
      } catch (err) {
        console.error('Error fetching server conversation:', err);
      } finally {
        setLoadingServer(false);
      }
    };

    fetchServerConversation();
  }, []);

  useEffect(() => {
    setInputValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  }, [activeConversationId]);

  const sendMessage = () => {
    if (!inputValue.trim() || disableInput) return;

    const newMessage = {
      role: 'user',
      content: inputValue.trim(),
      date: new Date()
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, newMessage], date: new Date() }
          : conv
      )
    );
    setInputValue('');
    setTextareaHeight(0);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleInput2 = e => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    const max = window.innerHeight * 0.25;
    const height = Math.min(e.target.scrollHeight, max);
    e.target.style.height = `${height}px`;
    setTextareaHeight(height - window.innerHeight * 0.09);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey && !disableInput) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const isEmpty = !activeConversation?.messages.length;
  const reachedLimit = activeConversation
    ? activeConversation.messages.filter(m => m.role === 'user').length >= MAX_MESSAGES
    : false;

  if (loadingServer) {
    return (
      <div className={styles.app}>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.mainContent} style={{ marginLeft: /* your sidebar logic */ }}>
        <div className={styles.conversation} style={{ paddingBottom: textareaHeight }}>
          {isEmpty ? (
            <div className={styles.emptyConversation}>
              <h2>How can I help you today?</h2>
              {!reachedLimit ? (
                <div className={styles.inputContainerCentered}>
                  <div className={styles.textareaContainer}>
                    <textarea
                      ref={inputRef}
                      className={styles.inactiveInput}
                      placeholder="Send a message..."
                      value={inputValue}
                      onChange={handleInput2}
                      onKeyDown={handleKeyDown}
                      disabled={disableInput}
                    />
                    <button
                      onClick={sendMessage}
                      className={
                        inputValue.trim()
                          ? `${styles.sendButton2} ${styles.sendButton2Active}`
                          : styles.sendButton2
                      }
                      disabled={disableInput}
                    >
                      <AiOutlineSend size={22} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.limitReachedAlert}>
                  <p>
                    Vous avez atteint la limite de {MAX_MESSAGES} messages pour cette conversation.
                    Veuillez soumettre votre idée finale.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <ChatWidget
                messages={activeConversation.messages}
                className={styles.messages}
                onStreamingChange={setDisableInput}
              />
              {!reachedLimit ? (
                <div className={styles.inputContainerActive} style={{ /* sidebar offset */ }}>
                  <div className={styles.inputWrapper}>
                    <textarea
                      ref={inputRef}
                      className={styles.activeInput2}
                      placeholder="Send a message..."
                      value={inputValue}
                      onChange={handleInput2}
                      onKeyDown={handleKeyDown}
                      disabled={disableInput}
                    />
                    <button
                      onClick={sendMessage}
                      className={
                        inputValue.trim()
                          ? `${styles.sendButton3} ${styles.sendButton3Active}`
                          : styles.sendButton3
                      }
                      disabled={disableInput}
                    >
                      <AiOutlineSend size={22} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.limitReachedAlert}>
                  <LuMailWarning size={27} />
                  <p>
                    You have reached the limit of {MAX_MESSAGES} messages for this conversation.
                    Please submit your final idea.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatboot;
