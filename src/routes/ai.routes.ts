import * as express from "express";
import { authentification } from "../middleware/authentification";
import { AIController } from "../controllers/ai.controller";

const Router = express.Router();

// Get AI-generated product review summary
Router.get(
    "/product/:product_id/summary",
    (req, res, next) => {
        console.log("AI product summary api called AUTHENTICATION");
        authentification(req, res, next)
    },
    (req, res) => {
        console.log('get AI product review summary is calling');
        AIController.getProductReviewSummary(req, res);
    }
);

// Get AI-generated product insights
Router.get(
    "/product/:product_id/insights",
    (req, res, next) => {
        console.log("AI product insights api called AUTHENTICATION");
        authentification(req, res, next)
    },
    (req, res) => {
        console.log('get AI product insights is calling');
        AIController.getProductInsights(req, res);
    }
);

export { Router as aiRouter }; 