import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit:"20kb" }))
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRoute from './routes/user.routes.js'

//routes decleration
app.use("/api/v1/users", userRoute)

// http://localhost:4000/api/v1/users/register

export default app;