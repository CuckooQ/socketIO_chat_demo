import { randomUUID } from "crypto";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const URL = {
  HOME: "/",
  API_USER: "/api/user",
};
const PORT = 3000;
const app = express();

app.use(URL.HOME, express.static(__dirname + "/"));

app.get(URL.API_USER, (_, res) => {
  const id = randomUUID();
  res.json({ id });
});

const server = http.createServer(app);

/* SOCKET IO */
const EVENT = {
  CONNECTION: "connection",
  MESSAGE: "message",
  PARTICIPATE: "participate",
  LEAVE: "disconnect",
  CONNECTION_ERROR: "connection_error",
};
const MESSAGE = {
  REPORT_USER_CNT: (cnt) => `${cnt}명이 참가하고 있습니다`,
};
const BOT_ID = "BOT";
function getTime() {
  const date = new Date();
  const min = date.getMinutes();
  let hour = date.getHours();
  let unit = "am";
  if (hour > 12) {
    hour %= 12;
    unit = "pm";
  }

  return `${hour}:${min}${unit}`;
}

let userCnt = 0;
const io = new Server(server, { cors: { origin: "*" } });
io.on(EVENT.CONNECTION, (socket) => {
  socket.on(EVENT.MESSAGE, ({ id, message }) => {
    io.emit(EVENT.MESSAGE, { id, message, time: getTime() });
  });

  socket.on(EVENT.PARTICIPATE, (_) => {
    userCnt++;
    io.emit(EVENT.MESSAGE, {
      id: BOT_ID,
      message: MESSAGE.REPORT_USER_CNT(userCnt),
      time: getTime(),
    });
  });

  socket.on(EVENT.LEAVE, (req) => {
    if (req === "transport close") {
      userCnt--;
      io.emit(EVENT.MESSAGE, {
        id: BOT_ID,
        message: MESSAGE.REPORT_USER_CNT(userCnt),
        time: getTime(),
      });
    }
  });
});
io.on(EVENT.CONNECTION_ERROR, ({ req, code, message, context }) => {
  console.log(
    "IO Connection is abnormally closed",
    req,
    code,
    message,
    context
  );
});

server.listen(PORT, () => {
  console.log("Server Connected");
});
