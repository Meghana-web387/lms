import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, AppError } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { subjectRouter } from "./modules/subjects/subject.routes.js";
import { videoRouter } from "./modules/videos/video.routes.js";
import { progressRouter } from "./modules/progress/progress.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  const origins = env.corsOrigin.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: origins.length === 1 ? origins[0] : origins,
      credentials: true,
    })
  );

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/subjects", subjectRouter);
  app.use("/api/videos", videoRouter);
  app.use("/api/progress", progressRouter);

  app.use((_req, _res, next) => {
    next(new AppError(404, "Not found"));
  });

  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Validation error", details: err.flatten() });
      return;
    }
    errorHandler(err, req, res, next);
  });

  return app;
}
