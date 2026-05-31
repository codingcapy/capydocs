import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { usersRouter } from "./routes/users";
import { userRouter } from "./routes/user";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", logger());
app.use("*", compress());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://visioncoding.up.railway.app"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

const PORT = parseInt(process.env.PORT!) || 3333;

const apiRoutes = app
  .basePath("/api/v0")
  .route("/users", usersRouter)
  .route("/user", userRouter);

export type ApiRoutes = typeof apiRoutes;
export default app;

app.use("/*", serveStatic({ root: "./frontend/dist" }));
app.get("/*", async (c) => {
  try {
    const indexHtml = await Bun.file("./frontend/dist/index.html").text();
    return c.html(indexHtml);
  } catch (error) {
    console.error("Error reading index.html:", error);
    return c.text("Internal Server Error", 500);
  }
});

const server = serve({
  port: PORT,
  fetch: app.fetch,
});
console.log("Server running on port", PORT);
