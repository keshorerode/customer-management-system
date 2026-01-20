import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { Person } from "./entities/Person";
import { Company } from "./entities/Company";
import { Opportunity } from "./entities/Opportunity";
import { Task } from "./entities/Task";
import { Note } from "./entities/Note";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

AppDataSource.initialize().then(() => {
    console.log("Data Source has been initialized!");

    // Generic CRUD helper (simplified)
    const setupCrud = (path: string, entity: any) => {
        const repo = AppDataSource.getRepository(entity);

        app.get(`/api/${path}`, async (req, res) => {
            const items = await repo.find({ relations: path === 'people' ? ['company'] : path === 'opportunities' ? ['company', 'pointOfContact'] : [] });
            res.json(items);
        });

        app.get(`/api/${path}/:id`, async (req, res) => {
            const item = await repo.findOne({ 
                where: { id: req.params.id } as any,
                relations: path === 'people' ? ['company'] : path === 'opportunities' ? ['company', 'pointOfContact'] : []
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

    setupCrud("people", Person);
    setupCrud("companies", Company);
    setupCrud("opportunities", Opportunity);
    setupCrud("tasks", Task);
    setupCrud("notes", Note);

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Error during Data Source initialization", err);
});
