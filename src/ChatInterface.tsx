import React, { useState, FormEvent, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  user: string;
}

const ChatBubble: React.FC<{message: Message}> = ({ message }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#7DBEEC', 
      borderRadius: '10px', 
      padding: '10px', 
      marginBottom: '10px' 
    }}>
      <span style={{
        fontSize: '1em',
        fontWeight: 'bold',
        textAlign: 'left'
      }}>{message.user}</span>
      <span style={{
        fontSize: '0.8em',
        fontStyle: 'italic',
        color: 'black'
      }}>{message.text}</span>
      <span style={{
        fontSize: '0.7em',
        opacity: 0.5,
        marginLeft: 'auto',
        fontStyle: 'italic'
      }}>{new Date(message.id).toLocaleTimeString()}</span>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [username, setUsername] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://13.235.103.165:8080');
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          setMessages((messages) => [...messages, message]);
        } catch (error) {
          console.error("Received data is not valid JSON: ", event.data);
        }
      };

    return () => {
      ws.close();
    };
  }, []);

  const handleNewMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleNewMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (wsRef.current && username) {
      const message: Message = {
        id: Date.now(),
        text: newMessage,
        user: username
      };
      wsRef.current.send(JSON.stringify(message));
      setMessages([...messages, message]);
      setNewMessage('');
    } else {
      console.error("WebSocket connection is not established or username is not set.");
    }
  };

  if (username === null) {
    return (
      <div>
        <form style ={{display: 'flex'}} onSubmit={(e) => { e.preventDefault(); setUsername(newMessage); setNewMessage(''); }}>
          <input
            type="text"
            value={newMessage}
            onChange={handleNewMessageChange}
            placeholder="Enter your username"
            style={{
              padding: '5px 50px',
              fontSize: '0.75em',
              borderRadius: '50px',
              border: '1px solid grey',
              width: '200%',
              marginRight: '10px',
            }}
          />
          <button type="submit" style={{
            padding: '5px 20px',
            fontSize: '1em',
            borderRadius: '50px',
            border: '2px solid purple',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.5s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'red'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'grey'
          }}>Enter</button>
        </form>
      </div>
    );
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
      <div style={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column-reverse' }}>
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      </div>
      <form onSubmit={handleNewMessage} style={{ display: 'flex', position: 'sticky' }}>
        <input
          type="text"
          value={newMessage}
          onChange={handleNewMessageChange}
          placeholder="Type your message here"
          style={{
            padding: '5px 50px',
            fontSize: '0.75em',
            borderRadius: '50px',
            border: '1px solid grey',
            width: '200%',
            marginRight: '10px',
          }}
        />
        <button type="submit"
          style={{
            padding: '5px 20px',
            fontSize: '1em',
            borderRadius: '50px',
            border: '2px solid purple',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.5s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'red'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'grey'
          }}
        >SEND</button>
      </form>
    </div>
  );
};

export default ChatInterface;