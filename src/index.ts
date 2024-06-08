import express, { Express, Request, Response } from "express";
//import connection from auth
import "./auth/connection";
import authRoutes from "./auth/auth_routes";
import cors from "cors";
//
const app: Express = express();
const port = process.env.PORT || 3000;
app.get("/", (req: Request, res: Response) => {
  res.send("our server");
});
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
//
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
//