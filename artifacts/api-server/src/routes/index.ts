import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import gatesRouter from "./gates.js";
import guestsRouter from "./guests.js";
import reportsRouter from "./reports.js";
import communityRouter from "./community.js";
import amenitiesRouter from "./amenities.js";
import emergencyRouter from "./emergency.js";
import contractorsRouter from "./contractors.js";
import platformRouter from "./platform.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(gatesRouter);
router.use(guestsRouter);
router.use(reportsRouter);
router.use(communityRouter);
router.use(amenitiesRouter);
router.use(emergencyRouter);
router.use(contractorsRouter);
router.use(platformRouter);

export default router;
