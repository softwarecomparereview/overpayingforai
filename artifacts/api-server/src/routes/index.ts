import { Router, type IRouter } from "express";
import healthRouter from "./health";
import artificialAnalysisRouter from "./artificialAnalysis";
import auditRouter from "./audit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(artificialAnalysisRouter);
router.use("/admin/audit", auditRouter);

export default router;
