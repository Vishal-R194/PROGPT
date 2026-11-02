
import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/GenAi.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();


// Get only the logged-in user's threads
router.get("/thread", verifyToken, async (req, res) => {
    try {
        const threads = await Thread.find({
            userId: req.user.userId
        })
            .select("threadId title createdAt updatedAt")
            .sort({ updatedAt: -1 });

        res.json(threads);
    } catch (err) {
        console.error("Fetch threads error:", err);
        res.status(500).json({
            error: "Failed to fetch threads"
        });
    }
});

// Get messages from an owned thread
router.get("/thread/:threadId", verifyToken, async (req, res) => {
    try {
        const thread = await Thread.findOne({
            threadId: req.params.threadId,
            userId: req.user.userId
        });

        if (!thread) {
            return res.status(404).json({
                error: "Chat not found"
            });
        }

        res.json(thread.messages);
    } catch (err) {
        console.error("Fetch chat error:", err);
        res.status(500).json({
            error: "Failed to fetch chat"
        });
    }
});

// Rename an owned thread
router.patch("/thread/:threadId", verifyToken, async (req, res) => {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            error: "A valid title is required"
        });
    }

    try {
        const thread = await Thread.findOneAndUpdate(
            {
                threadId: req.params.threadId,
                userId: req.user.userId
            },
            {
                title: title.trim().slice(0, 60)
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!thread) {
            return res.status(404).json({
                error: "Chat not found"
            });
        }

        res.json({
            threadId: thread.threadId,
            title: thread.title
        });
    } catch (err) {
        console.error("Rename thread error:", err);
        res.status(500).json({
            error: "Failed to rename chat"
        });
    }
});

// Delete an owned thread
router.delete("/thread/:threadId", verifyToken, async (req, res) => {
    try {
        const deletedThread = await Thread.findOneAndDelete({
            threadId: req.params.threadId,
            userId: req.user.userId
        });

        if (!deletedThread) {
            return res.status(404).json({
                error: "Chat not found"
            });
        }

        res.json({
            success: "Thread deleted successfully"
        });
    } catch (err) {
        console.error("Delete thread error:", err);
        res.status(500).json({
            error: "Failed to delete chat"
        });
    }
});

// Chat with Gemini using the owner's conversation history
router.post("/chat", verifyToken, async (req, res) => {
    const { threadId, message } = req.body;

    if (
        typeof threadId !== "string" ||
        !threadId.trim() ||
        typeof message !== "string" ||
        !message.trim()
    ) {
        return res.status(400).json({
            error: "A valid threadId and message are required"
        });
    }

    const cleanThreadId = threadId.trim();
    const cleanMessage = message.trim();
    const userId = req.user.userId;

    try {
        // Find this thread only if it belongs to this user
        let thread = await Thread.findOne({
            threadId: cleanThreadId,
            userId
        });

        // Don't let users claim another user's or a legacy thread
        if (!thread) {
            const existingThread = await Thread.findOne({
                threadId: cleanThreadId
            });

            if (existingThread) {
                return res.status(404).json({
                    error: "Chat not found"
                });
            }
        }

        // Use recent messages as Gemini context
        const previousMessages = (thread?.messages || [])
            .filter(
                (msg) =>
                    ["user", "assistant"].includes(msg.role) &&
                    typeof msg.content === "string" &&
                    msg.content.trim()
            )
            .slice(-20);

        const conversationHistory = previousMessages.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        conversationHistory.push({
            role: "user",
            parts: [{ text: cleanMessage }]
        });

        const assistantReply = await getGeminiAPIResponse(
            conversationHistory
        );

        // Create a new thread owned by the authenticated user
        if (!thread) {
            thread = new Thread({
                threadId: cleanThreadId,
                userId,
                title: cleanMessage.slice(0, 60),
                messages: []
            });
        }

        thread.messages.push(
            { role: "user", content: cleanMessage },
            { role: "assistant", content: assistantReply }
        );

        thread.updatedAt = new Date();

        await thread.save();

        return res.json({
            reply: assistantReply
        });
    } catch (err) {
        console.error("Chat route error:", err);

        const status = [429, 503].includes(err.status)
            ? err.status
            : 500;

        const errorMessage =
            status === 503
                ? "Gemini is temporarily busy. Please try again shortly."
                : status === 429
                    ? "Gemini request limit reached. Please try again later."
                    : "Something went wrong while generating the response.";

        return res.status(status).json({
            error: errorMessage
        });
    }
});

export default router;
