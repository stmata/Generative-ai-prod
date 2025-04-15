import React, { useState, useRef, useEffect } from 'react';
import ChatWidget from './Chat';
import styles from './Chatboot.module.css';
import { AiOutlineSend } from 'react-icons/ai';

import { getConversation } from '../../services/getConversation';

const Chatboot = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'New Chat 1',
      messages: [],
      date: new Date(),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState(1);

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const [loadingServer, setLoadingServer] = useState(true);

  const [disableInput, setDisableInput] = useState(false);

  useEffect(() => {
    const fetchServerConversation = async () => {
      try {
        const serverHistory = await getConversation();

        if (serverHistory.length > 0) {
          const transformed = serverHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
            date: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }));

          setConversations([
            {
              id: 1,
              name: 'Server Chat',
              messages: transformed,
              date: new Date(),
            },
          ]);
          setActiveConversationId(1);
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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [activeConversationId]);


  const sendMessage = () => {
    if (!inputValue.trim() || disableInput) return;

    const newMessage = {
      role: 'user',
      content: inputValue.trim(),
      date: new Date(),
    };

    if (activeConversationId === null) {
      const newConv = {
        id: 1,
        name: 'conv1',
        messages: [newMessage],
        date: new Date(),
      };
      setConversations([newConv]);
      setActiveConversationId(1);
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              date: new Date(),
            }
            : conv
        )
      );
    }

    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    const maxHeight = window.innerHeight * 0.25;
    if (e.target.scrollHeight > maxHeight) {
      e.target.style.height = `${maxHeight}px`;
      e.target.style.overflowY = 'scroll';
    } else {
      e.target.style.height = `${e.target.scrollHeight}px`;
      e.target.style.overflowY = 'hidden';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disableInput) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConversation = conversations.find((conv) => conv.id === activeConversationId);
  const isEmptyConversation = activeConversation && activeConversation.messages.length === 0;

  if (loadingServer) {
    return (
      <div className={styles.app}>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>

      <div
        className={styles.mainContent}
        style={{ marginLeft: sidebarOpen ? '300px' : '0px' }}
      >
        <div className={styles.conversation}>
          {activeConversation ? (
            isEmptyConversation ? (
              <div className={styles.emptyConversation}>
                <h2>How can I help you today?</h2>
                <div className={styles.inputContainerCentered}>
                  <div
                    className={styles.textareaContainer}
                    style={{ position: 'relative', width: '100%' }}
                  >
                    <textarea
                      ref={inputRef}
                      className={
                        activeConversation && activeConversation.messages.length > 0
                          ? styles.activeInput
                          : styles.inactiveInput
                      }
                      placeholder="Send a message..."
                      value={inputValue}
                      onChange={handleInput}
                      onKeyDown={handleKeyDown}
                      disabled={disableInput}
                    />
                    <button
                      onClick={sendMessage}
                      className={styles.sendButton}
                      disabled={disableInput}
                    >
                      <AiOutlineSend color="#BF0030" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <ChatWidget
                messages={activeConversation.messages}
                className={styles.messages}
                onStreamingChange={setDisableInput}
              />
            )
          ) : (
            <div className={styles.placeholder}></div>
          )}
        </div>
      </div>

      {activeConversation && activeConversation.messages.length > 0 && (
        <div
          className={styles.inputContainerActive}
          style={{
            left: sidebarOpen ? '300px' : '0px',
          }}
        >
          <div className={styles.inputWrapper}>
            <textarea
              ref={inputRef}
              className={styles.activeInput}
              placeholder="Send a message..."
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={disableInput}
            />
            <button
              onClick={sendMessage}
              className={styles.sendButton2}
              disabled={disableInput}
            >
              <AiOutlineSend color="#BF0030" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatboot;
