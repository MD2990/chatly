import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import Chat from "./components/Chat";
import { Button, Input, Text, Wrap, WrapItem } from "@chakra-ui/react";

const socket = io.connect(process.env.server);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    socket.on("login", (data) => {
      setShowChat(true);
    });
    socket.on("error", (data) => {
      alert(data.message);
    });

    return () => socket.disconnect();
  }, []);
  const joinRoom = () => {
    if (username !== "" && room !== "") {
      const data = { username, room };
      socket.emit("join_room", data);
      socket.emit("online", data);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <Wrap
          direction={"column"}
          justify={"center"}
          spacing={[1, 2, 3]}
          color={"twitter.500"}
          borderRadius={"lg"}
          boxShadow={["md", "lg", "xl"]}
          textShadow={`0px 0px 10px lightgray`}
          p={[4, 8, 12, 24]}
          m="4"
        >
          <Text fontSize={["2xl", "4xl", "6xl", "7xl"]} textAlign={"center"}>
            Join A Chat
          </Text>
          <WrapItem>
            <Input
              size={"lg"}
              placeholder="Your Name..."
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
          </WrapItem>
          <WrapItem>
            <Input
              size={"lg"}
              placeholder="Room ID..."
              onChange={(event) => {
                setRoom(event.target.value);
              }}
            />
          </WrapItem>
          <WrapItem alignSelf={"center"}>
            <Button
              size={"lg"}
              fontSize={[12, 16, 22, 28]}
              p={[2, 4, 8, 10]}
              onClick={joinRoom}
            >
              Join A Room
            </Button>
          </WrapItem>
        </Wrap>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
