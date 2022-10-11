import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();

const port = 4000;

app.get("/airports", async (req, res) => {
  try {
    const airports = await prisma.airport.findMany({
      include: {
        arrivalFlights: true,
        departureFlights: true,
        flyCompanies: true,
      },
    });
    res.send(airports);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/flights", async (req, res) => {
  try {
    const flights = await prisma.flight.findMany();
    res.send(flights);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App is running: http://localhost:${port}`);
});
