import { Router, type IRouter } from "express";
import healthRouter from "./health";
import artificialAnalysisRouter from "./artificialAnalysis";

const router: IRouter = Router();

router.use(healthRouter);
router.use(artificialAnalysisRouter);

export default router;
