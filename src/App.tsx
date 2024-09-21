import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button, TextField, Avatar, Container, Paper, Box } from '@mui/material';
import './ChatRoom.css'; // Asumiendo que estás usando un archivo CSS separado para estilos adicionales

interface Message {
  _id?: number;
  username: string;
  text: string;
  avatar?: string;
  createdAt?: string;
}

const socket: Socket = io('http://localhost:5000'); // Conexión al servidor de Socket.io

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    // Escuchar mensajes existentes cuando el cliente se conecta
    socket.on('allMessages', (history: Message[]) => {
      console.log({ history });
      setMessages(history); // Establece los mensajes antiguos al estado
    });

    // Escuchar mensajes nuevos en tiempo real
    socket.on('createMessage', (newMessage: Message) => {
      console.log('Nuevo mensaje recibido: ', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Limpiar el efecto cuando el componente se desmonta
    return () => {
      socket.off('allMessages');
      socket.off('createMessage');
    };
  }, []);

  const handleSendMessage = () => {
    if (messageInput.trim() && username.trim()) {
      const newMessage: Message = {
        username: username,
        text: messageInput.trim(),
      };

      // Actualizar inmediatamente el estado con el nuevo mensaje
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...newMessage, _id: Date.now() }, // Asigna temporalmente un _id
      ]);

      // Enviar el mensaje al servidor de Socket.io
      socket.emit('createMessage', newMessage);

      setMessageInput('');
    }
  };

  return (
    <Container maxWidth="sm" className="chat-container">
      <Paper elevation={3} className="chat-box">
        {/* Caja de texto para el nombre de usuario */}
        <Box className="username-input">
          <TextField
            label="Escribe tu nombre de usuario"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
        </Box>

        {/* Área de los mensajes */}
        <Box className="messages-container" sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {messages.map((message) => (
            <Box key={message._id} display="flex" alignItems="flex-start" mb={2}>
              <Avatar src={message.avatar} alt={message.username} />
              <Box ml={2}>
                <p className="username">{message.username}</p>
                <p className="message-content">{message.text}</p>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Caja de texto y botón para enviar mensajes */}
        <Box className="message-input" display="flex" alignItems="center" p={2} borderTop={1}>
          <TextField
            label="Escribe tu mensaje..."
            variant="outlined"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            fullWidth
            className="message-textfield"
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} className="send-button">
            Enviar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
