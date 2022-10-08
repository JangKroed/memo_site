const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Todo = require("./models/todo");
const cookieParser = require("cookie-parser");

mongoose.connect("mongodb://localhost/memo_site", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();
app.use(cookieParser());

router.get("/", (req, res) => {
  res.send("Hi!");
});

router.get("/todos", async (req, res) => {
  const todos = await Todo.find().sort("-order").exec();

  res.send({ todos });
});

router.post("/todos", async (req, res) => {
  const { value } = req.body;
  const maxOrderTodo = await Todo.findOne().sort("-order").exec();
  let order = 1;

  if (maxOrderTodo) {
    order = maxOrderTodo.order + 1;
  }

  const todo = new Todo({ value, order });
  await todo.save();

  res.send({ todo });
});

router.patch("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { order } = req.body;
  //
  const todo = await Todo.findById(todoId).exec();
  //   if (currentTodo) {
  //     throw new Error("존재하지 않는 todo 데이터입니다.");
  //   }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = todo.order;
      await targetTodo.save();
    }
    todo.order = order;
    await todo.save();
  }

  res.send({});
});

router.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  await todo.delete();

  res.send({});
});

router.put("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { order, value, done } = req.body;

  const todo = await Todo.findById(todoId).exec();

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = todo.order;
      await targetTodo.save();
    }
    todo.order = order;
  } else if (value) {
    todo.value = value;
  } else if (done !== undefined) {
    todo.doneAt = done ? new Date() : null;
  }
  await todo.save();

  res.send({});
});

// Set-Cookie를 이용한 쿠키 할당
// app.get("/set-cookie", (req, res) => {
//   const expire = new Date();
//   // 만료 시간을 60분으로 설정
//   expire.setMinutes(expire.getMinutes() + 60);

//   res.writeHead(200, {
//     "Set-Cookie": `name=sparta; Expires=${expire.toGMTString()};HttOnly;Path=/`,
//   });
//   return res.status(200).end();
// });

// res.cookie()를 이용하여 쿠키 할당 (좀더 간결함)
// app.get("/set-cookie", (req, res) => {
//   const expires = new Date();
//   expires.setMinutes(expires.getMinutes() + 60);

//   res.cookie("name", "sparta", {
//     expires: expires,
//   });
//   return res.status(200).end();
// });

// set으로 호출했을 때 name에 nodejs가 저장된 쿠키 할당
app.get("/set", (req, res) => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 60);

  res.cookie("name", "nodejs", {
    expires: expires,
  });
  return res.status(200).end();
});

// /get-cookie에 접근시 설정된 쿠키를 출력하는 API
// app.get("/get-cookie", (req, res) => {
//   const cookie = req.headers.cookie;
//   console.log(cookie);
//   return res.status(200).json({ cookie });
// });

// cookie-parser로 쿠키 출력
// app.get("/get-cookie", (req, res) => {
//   const cookie = req.cookies;
//   console.log(cookie);
//   return res.status(200).json({ cookie });
// });

// get으로 호출했을 때, 등록된 정보를 출력
app.get("/get", (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  return res.status(200).json({ cookie });
});

// /set-session API 만들기
let session = {};
app.get("/set-session", (req, res, next) => {
  const name = "sparta";
  const uniqueInt = Date.now();
  session[uniqueInt] = { name };

  res.cookie("sessionKey", uniqueInt);
  return res.status(200).end();
});

// /get-session API 만들기
app.get("/get-session", (req, res, next) => {
  const { sessionKey } = req.cookies;
  const name = session[sessionKey];
  return res.status(200).json({ name });
});

app.use("/api", bodyParser.json(), router);
app.use(express.static("./assets"));

app.listen(8080, () => {
  console.log("서버가 켜졌어요!");
});
