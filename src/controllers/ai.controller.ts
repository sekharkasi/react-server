import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { ProductReviews } from "../entity/ProductReviews";
import OpenAI from "openai";

export class AIController {
    private static openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    static async getProductReviewSummary(req: Request, res: Response) {
        try {
            const { product_id } = req.params;

            if (!product_id) {
                return res.status(400).json({ message: "Product ID is required" });
            }

            // Get product details
            const productRepository = AppDataSource.getRepository(Product);
            const product = await productRepository.findOne({
                where: { id: product_id }
            });

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            // Get all reviews for the product
            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const reviews = await reviewRepository.find({
                where: { product_id },
                relations: ['user'],
                order: { created_at: 'DESC' }
            });

            if (reviews.length === 0) {
                return res.status(200).json({ 
                    message: "No reviews available for this product",
                    summary: "This product doesn't have any reviews yet. Be the first to share your experience!",
                    product: product
                });
            }

            // Calculate average rating
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

            // Prepare review data for AI analysis
            const reviewData = reviews.map(review => ({
                rating: review.rating,
                review: review.review,
                userName: review.user?.name || 'Anonymous',
                date: review.created_at
            }));

            // Create prompt for OpenAI
            const prompt = `Analyze the following product reviews and provide a comprehensive summary:

Product: ${product.product_name}
Description: ${product.description || 'No description available'}
Price: ₹${product.price_per_unit}

Reviews (${reviews.length} total reviews, average rating: ${Math.round(averageRating * 100) / 100}/5):

${reviewData.map((review, index) => 
    `Review ${index + 1}:
    Rating: ${review.rating}/5
    User: ${review.userName}
    Date: ${new Date(review.date).toLocaleDateString()}
    ${review.review ? `Comment: "${review.review}"` : 'No comment provided'}
    `
).join('\n')}

Please provide a comprehensive summary that includes:
1. Overall sentiment analysis
2. Key strengths and weaknesses mentioned
3. Common themes in the reviews
4. Recommendations for potential buyers
5. A brief conclusion

Keep the summary professional, balanced, and helpful for potential customers.`;

console.log("PROMPT>>>>>", prompt);

            // Call OpenAI API
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful product review analyst. Provide balanced, professional summaries of product reviews that help customers make informed decisions."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            });

            const aiSummary = completion.choices[0]?.message?.content || "Unable to generate summary";

            return res.status(200).json({
                message: "Product review summary generated successfully",
                product: {
                    id: product.id,
                    name: product.product_name,
                    description: product.description,
                    price: product.price_per_unit,
                    image: product.image
                },
                reviewStats: {
                    totalReviews: reviews.length,
                    averageRating: Math.round(averageRating * 100) / 100,
                    ratingDistribution: {
                        5: reviews.filter(r => r.rating === 5).length,
                        4: reviews.filter(r => r.rating === 4).length,
                        3: reviews.filter(r => r.rating === 3).length,
                        2: reviews.filter(r => r.rating === 2).length,
                        1: reviews.filter(r => r.rating === 1).length
                    }
                },
                aiSummary: aiSummary,
                reviews: reviewData
            });

        } catch (error) {
            console.error("Error generating AI summary:", error);
            
            // Handle OpenAI API errors specifically
            if (error instanceof OpenAI.APIError) {
                return res.status(500).json({ 
                    message: "Error connecting to AI service", 
                    error: error.message 
                });
            }

            return res.status(500).json({ 
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    static async getProductInsights(req: Request, res: Response) {
        try {
            const { product_id } = req.params;

            if (!product_id) {
                return res.status(400).json({ message: "Product ID is required" });
            }

            // Get product details
            const productRepository = AppDataSource.getRepository(Product);
            const product = await productRepository.findOne({
                where: { id: product_id }
            });

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            // Get all reviews for the product
            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const reviews = await reviewRepository.find({
                where: { product_id },
                relations: ['user'],
                order: { created_at: 'DESC' }
            });

            if (reviews.length === 0) {
                return res.status(200).json({ 
                    message: "No reviews available for insights",
                    insights: {
                        sentiment: "neutral",
                        keyPoints: [],
                        recommendations: ["This product doesn't have any reviews yet. Consider being the first to review it!"]
                    }
                });
            }

            // Calculate statistics
            const totalRating = reviews.filter(r => r.rating).reduce((sum, review) => sum + review.rating, 0);
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
            const positiveReviews = reviews.filter(r => r.rating >= 4).length;
            const negativeReviews = reviews.filter(r => r.rating <= 2).length;
            const neutralReviews = reviews.filter(r => r.rating === 3).length;

            // Create insights prompt
            const insightsPrompt = `Analyze these product reviews and provide insights in JSON format:

Product: ${product.product_name}
Total Reviews: ${reviews.length}
Average Rating: ${Math.round(averageRating * 100) / 100}/5

Reviews:
${reviews.map((review, index) => 
    `Review ${index + 1}: Rating ${review.rating}/5 - ${review.review || 'No comment'}`
).join('\n')}

Please provide insights in this JSON format:
{
    "sentiment": "positive/negative/neutral",
    "keyPoints": ["point1", "point2", "point3"],
    "recommendations": ["rec1", "rec2"],
    "confidence": 0.85
}`;

            // Call OpenAI API for insights
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a product analyst. Provide insights in valid JSON format only."
                    },
                    {
                        role: "user",
                        content: insightsPrompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.3
            });

            const aiResponse = completion.choices[0]?.message?.content || "{}";
            let insights;
            
            try {
                insights = JSON.parse(aiResponse);
            } catch (parseError) {
                // Fallback insights if JSON parsing fails
                insights = {
                    sentiment: averageRating >= 4 ? "positive" : averageRating <= 2 ? "negative" : "neutral",
                    keyPoints: ["Analysis unavailable"],
                    recommendations: ["Consider reading individual reviews for detailed insights"],
                    confidence: 0.5
                };
            }

            return res.status(200).json({
                message: "Product insights generated successfully",
                product: {
                    id: product.id,
                    name: product.product_name,
                    description: product.description,
                    price: product.price_per_unit
                },
                statistics: {
                    totalReviews: reviews.length,
                    averageRating: Math.round(averageRating * 100) / 100,
                    positiveReviews,
                    negativeReviews,
                    neutralReviews
                },
                insights: insights
            });

        } catch (error) {
            console.error("Error generating insights:", error);
            return res.status(500).json({ 
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
} 