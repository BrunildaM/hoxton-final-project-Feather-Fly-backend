import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { generateToken, hash } from "./auth";
import { verify } from "jsonwebtoken";

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

app.post("/airports", async (req, res) => {});

app.get("/flights", async (req, res) => {
  try {
    const flights = await prisma.flight.findMany();
    res.send(flights);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/flights", async (req, res) => {});

//Log-in a user that already exists with it's credentials
//Check if they email exists on our db
//Check if the e-mail and password match
app.post("sign-in", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && verify(password, user.password)) {
    const token = generateToken(user.id);
    res.send({ user, token });
  }
});

//Create a new account for users
//Don't allow a user under 18 to create an account- needs to be done
app.post("sign-up", async (req, res) => {
  const { email, password, gender, age, firstName, lastName } = req.body;
  try {

    //Check if the email is already in our db
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    //Make sure they don't create two accounts with the same email
    if (existingUser) {
      return res.status(400).send({ error: "User already exists!" });
    } 
      const userData = {
        gender,
        age,
        firstName,
        lastName,
        email,
        password: hash(password),
      };

      const newUser = await prisma.user.create({
        data: userData,
      });

      const token = generateToken(newUser.id);
      res.send({ newUser, token });
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("validate");

app.listen(port, () => {
  console.log(`App is running: http://localhost:${port}`);
});
