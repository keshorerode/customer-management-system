import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { Person } from "./entities/Person";
import { Company } from "./entities/Company";
import { Opportunity } from "./entities/Opportunity";
import { Task } from "./entities/Task";
import { Note } from "./entities/Note";

import { Lead } from "./entities/Lead";
import { GmailThread } from "./entities/GmailThread";
import { GmailAuth } from "./entities/GmailAuth";
import { GmailService } from "./services/gmail.service";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const gmailService = new GmailService();

AppDataSource.initialize().then(() => {
    console.log("Data Source has been initialized!");

    // Generic CRUD helper (simplified)
    const setupCrud = (path: string, entity: any) => {
        const repo = AppDataSource.getRepository(entity);

        app.get(`/api/${path}`, async (req, res) => {
            let relations: string[] = [];
            if (path === 'people') relations = ['company'];
            else if (path === 'opportunities') relations = ['company', 'pointOfContact'];
            else if (path === 'leads') relations = [];

            const items = await repo.find({ relations });
            res.json(items);
        });

        app.get(`/api/${path}/:id`, async (req, res) => {
            let relations: string[] = [];
            if (path === 'people') relations = ['company'];
            else if (path === 'opportunities') relations = ['company', 'pointOfContact'];
            else if (path === 'leads') relations = [];

            const item = await repo.findOne({
                where: { id: req.params.id } as any,
                relations
            });
            res.json(item);
        });

        app.post(`/api/${path}`, async (req, res) => {
            const newItem = repo.create(req.body);
            const savedItem = await repo.save(newItem);
            res.json(savedItem);
        });

        app.patch(`/api/${path}/:id`, async (req, res) => {
            await repo.update(req.params.id, req.body);
            const updatedItem = await repo.findOneBy({ id: req.params.id } as any);
            res.json(updatedItem);
        });

        app.delete(`/api/${path}/:id`, async (req, res) => {
            await repo.softDelete(req.params.id);
            res.json({ success: true });
        });
    };

    // Custom Delete for Leads to cascade delete threads
    app.delete('/api/leads/:id', async (req, res) => {
        const leadRepo = AppDataSource.getRepository(Lead);
        const threadRepo = AppDataSource.getRepository(GmailThread);
        const leadId = req.params.id;

        // Delete related threads
        await threadRepo.delete({ lead: { id: leadId } });

        // Soft delete the lead
        await leadRepo.softDelete(leadId);
        res.json({ success: true });
    });

    setupCrud("people", Person);
    setupCrud("companies", Company);
    setupCrud("opportunities", Opportunity);
    setupCrud("tasks", Task);
    setupCrud("notes", Note);
    setupCrud("leads", Lead);

    // Gmail Endpoints
    app.get("/api/gmail/status", async (req, res) => {
        const isConnected = await gmailService.loadSavedCredentials();
        res.json({ isConnected });
    });

    app.get("/api/gmail/auth-url", (req, res) => {
        res.json({ url: gmailService.getAuthUrl() });
    });

    app.post("/api/gmail/disconnect", async (req, res) => {
        await gmailService.logout();
        res.json({ success: true });
    });

    app.get("/api/gmail/callback", async (req, res) => {
        const { code } = req.query;
        if (code) {
            await gmailService.saveTokens(code as string);
            res.send("Authentication successful! You can close this tab.");
        } else {
            res.status(400).send("No code provided");
        }
    });

    app.post("/api/gmail/sync", async (req, res) => {
        try {
            await gmailService.syncThreads();
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/gmail/threads", async (req, res) => {
        const threadRepo = AppDataSource.getRepository(GmailThread);
        const threads = await threadRepo.find({ relations: ['lead'], order: { lastMessageDate: 'DESC' } });
        res.json(threads);
    });

    app.delete("/api/gmail/threads/:id", async (req, res) => {
        const threadRepo = AppDataSource.getRepository(GmailThread);
        await threadRepo.delete(req.params.id); // Using delete instead of softDelete for now, or softDelete if supported
        res.json({ success: true });
    });

    app.get("/api/gmail/threads/:id/messages", async (req, res) => {
        try {
            const messages = await gmailService.getThreadMessages(req.params.id);
            res.json(messages);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/gmail/threads/:id/reply", async (req, res) => {
        try {
            const { text } = req.body;
            await gmailService.sendReply(req.params.id, text);
            res.json({ success: true });
        } catch (error: any) {
            console.error('Error in reply endpoint:', error);
            if (error.response?.data) {
                console.error('Google API Error Details:', JSON.stringify(error.response.data, null, 2));
            }
            res.status(500).json({ error: error.message });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Error during Data Source initialization", err);
});
