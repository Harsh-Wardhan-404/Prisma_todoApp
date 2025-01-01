import { PrismaClient } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { userMiddleware } from "./middleware";

const JWT_SECRET = "harshlmao"

const app = express();
app.use(express.json())

const client = new PrismaClient();

interface CustomJwtPayload extends JwtPayload {
  id: string
}



// async function createUser() {
//   const user = await client.user.findFirst({
//     where: { id: 1 },
//     include: { todos: true }
//   })
//   console.log(user);
// }

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const user = await client.user.create({
    data: {
      username,
      password
    }
  })
  res.json({
    message: "User created",
    user
  })

})

app.post('/signin', async (req, res) => {
  //returns all users
  const { username, password } = req.body;
  try {
    const user = await client.user.findFirst({
      where: { username: username, password: password }
    })
    if (user) {
      const token = jwt.sign({
        id: user.id,
        username: username
      }, JWT_SECRET);
      res.json({ token })
    } else {
      res.status(403).json({ message: "user not found" });
    }
  }
  catch (e) {
    console.error(e);
  }
})

// app.get('/users', async (req, res) => {
//   //returns all users
// })

interface TodoRequestBody {
  title: string,
  description: string,
}

app.post('/todo', userMiddleware, async (req: Request<{}, {}, TodoRequestBody>, res: Response) => {
  const { title, description } = req.body;
  if (!title) {
    res.status(400).json({ message: "Please provide title" });
    return;
  }
  try {
    //@ts-ignore
    const userId = parseInt(req.userId);

    const todo = await client.todos.create({
      data: {
        title,
        description,
        done: false,
        user_id: userId,
      }
    })
    res.status(200).json({ message: "Added todo" });
  }
  catch (e) {
    console.log("Error: ", e);
    res.status(403).json(e);
  }
  //adds a todo
})

app.get('/todo', userMiddleware, async (req, res) => {
  //gets all todos of that user
  //@ts-ignore
  const userId = parseInt(req.userId);
  try {
    const todos = await client.todos.findMany({
      where: { user_id: userId },
    })
    res.status(200).json({ todos });
  } catch (e) {
    res.json(e);
  }
})


app.listen(3000, () => {
  console.log('Listening at 3000');
})

// createUser();
