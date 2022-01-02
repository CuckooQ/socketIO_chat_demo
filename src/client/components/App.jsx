import axios from "axios";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import styled from "styled-components";

const AppWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Chat = styled.div`
  width: 100%;
  height: 88vh;
  background-color: #ffffff;
  overflow-y: auto;
  scroll-behavior: smooth;
`;

const MessageArea = styled.div`
  position: relative;
  width: 100%;
  min-height: 10rem;
  font-size: 1.2rem;
`;

const MyMessageArea = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  max-width: 50%;
  text-align: end;
`;

const MyMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  min-width: 10rem;
  min-height: 5rem;
  border-radius: 1rem;
  border-bottom-right-radius: 0;
  background-color: #f0f0f0;
`;

const GuestMessageArea = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 50%;
  text-align: start;
`;

const GuestMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  min-width: 10rem;
  min-height: 5rem;
  border-radius: 1rem;
  border-bottom-left-radius: 0;
  color: #ffffff;
  background-color: #e9897e;
`;

const Paragraph = styled.p`
  max-width: 80%;
  word-break: break-all;
  text-align: left;
`;

const Time = styled.span`
  font-size: 0.8rem;
  color: #b0b0b0;
`;

const ChatFooter = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 10%;
  margin: 1% 0 1% 0;
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 2rem;
  padding: 1rem;
  border-radius: 10rem;
  background-color: #f0f0f0;
`;

const Input = styled.input`
  width: 90%;
  border: none;
  outline: none;
  font-size: 1.2rem;
  background-color: #f0f0f0;
`;

const Button = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  outline: none;
  color: #ffffff;
  background-color: #e9897e;
  font-weight: bold;
`;

function App() {
  const socket = io();

  const chatRef = useRef();
  const inputRef = useRef();

  const [chat, setChat] = useState([]);
  const [userId, setUserId] = useState("");
  const [userMessage, setUserMessage] = useState("");

  const SOCKET_EVENT = {
    CONNECT: "connect",
    MESSAGE: "message",
    PARTICIPATE: "participate",
  };

  const getUserId = async () => {
    await axios.get("/api/user").then((res) => {
      setUserId(res.data.id);
    });
  };

  useEffect(() => {
    socket.on(SOCKET_EVENT.CONNECT, () => {
      getUserId();
    });

    socket.on(SOCKET_EVENT.MESSAGE, ({ id, message, time }) => {
      chat.push({ id, message, time });
      setChat([...chat]);
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
  }, []);

  useEffect(() => {
    userId && socket.emit(SOCKET_EVENT.PARTICIPATE, { id: userId });
  }, [userId]);

  const clearMessage = () => {
    setUserMessage("");
    inputRef.current.value = "";
  };

  const handleMessageChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    userMessage !== "" &&
      socket.emit(SOCKET_EVENT.MESSAGE, { id: userId, message: userMessage });
    clearMessage();
  };

  return (
    <AppWrapper>
      <Chat ref={chatRef}>
        {chat.map(({ id, message, time }, idx) => {
          return (
            <MessageArea key={idx}>
              {id === userId ? (
                <MyMessageArea>
                  <MyMessage>
                    <Paragraph>{message}</Paragraph>
                  </MyMessage>
                  <Time>{time}</Time>
                </MyMessageArea>
              ) : (
                <GuestMessageArea>
                  <GuestMessage>
                    <Paragraph>{message}</Paragraph>
                  </GuestMessage>
                  <Time>{time}</Time>
                </GuestMessageArea>
              )}
            </MessageArea>
          );
        })}
      </Chat>
      <ChatFooter>
        <Form onSubmit={handleMessageSubmit}>
          <Input onChange={handleMessageChange} ref={inputRef}></Input>
          <Button>➥</Button>
        </Form>
      </ChatFooter>
    </AppWrapper>
  );
}

export default App;
