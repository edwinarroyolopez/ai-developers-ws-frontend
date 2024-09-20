// GroupChat.tsx
'use client'

import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { Box, Button, TextField, Avatar, Typography, List, ListItem, ListItemAvatar, ListItemText, Input } from '@mui/material'

// Definir tipo para el mensaje
type Message = {
  _id?: string
  username: string
  text: string
  createdAt?: string
}

// Endpoint de Socket.IO
// const socket = io('http://localhost:4000')
const socket = io('https://ai-developers-ws-backend-production.up.railway.app')


export default function GroupChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('')


  // Obtener todos los mensajes
  useEffect(() => {
    socket.on('allMessages', (msgs) => {
      console.log({ msgs });
      if (messages.length === 0) {
        setMessages(msgs)
      }
    });
  }, [messages])

  // Efecto para escuchar mensajes entrantes
  useEffect(() => {
    socket.on('receiveMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })

    return () => {
      socket.off('receiveMessage')
    }
  }, [])

  // Manejar el envío de mensajes
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message: Message = {
        username: userName,
        text: newMessage.trim()
      }
      socket.emit('sendMessage', message)
      // setMessages([userName...messages, message])
      setNewMessage('')
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={600}
      maxWidth={500}
      mx="auto"
      border={1}
      borderRadius={2}
      overflow="hidden"
    >
      <Box bgcolor="primary.main" p={2} color="primary.contrastText">
        <Typography variant="h6" fontWeight="bold">Group Chat</Typography>
      </Box>
      <Box flexGrow={1} overflow="auto" p={2}>
        <List>
          {messages.map((message) => {
            console.log({ message })
            return (
              <ListItem key={message._id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.username}`} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography component="span" fontWeight="bold">
                      {message.username}
                      <Typography component="span" variant="body2" color="textSecondary" ml={1}>
                        {message.createdAt || '-no date-'}
                      </Typography>
                    </Typography>
                  }
                  secondary={message.text}
                />
              </ListItem>
            )
          })

          }
        </List>
      </Box>
      <Box  p={2} display="flex">
        <Input placeholder='Put your username!' value={userName} fullWidth onChange={(e) => setUserName(e.target.value)} />
      </Box>
      <Box component="form" onSubmit={handleSendMessage} p={2} display="flex">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          margin="normal"
          sx={{ flexGrow: 1, mr: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Box>
  )
}
