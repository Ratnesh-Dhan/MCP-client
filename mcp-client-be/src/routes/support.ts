import { Router } from "express";

const SupportRouter = Router();

SupportRouter.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default SupportRouter;
