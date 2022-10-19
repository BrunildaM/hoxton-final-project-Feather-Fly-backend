import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { generateToken, getCurrentUser, hash, verify } from "./auth";

const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());
const prisma = new PrismaClient();

const port = 4000;

app.get("/capitals", async (req, res) => {
  try {
    const capitals = await prisma.capitals.findMany();
    res.send(capitals);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

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
    const flights = await prisma.flight.findMany({
      include: { arrivesAt: true, departsFrom: true, flyCompany: true },
    });
    res.send(flights);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

//Getting flights by location of arrival or departure and time
app.post("/search", async (req, res) => {

  const { departs, arrives, date } = req.body;

  const results = await prisma.flight.findMany({
    where: {
      departsFrom: { location: { contains: departs } },
      arrivesAt: { location: { contains: arrives } },
      departureTime: date
        ? {
            gte: new Date(date + "T00:00:00Z"),
            lte: new Date(date + "T23:59:59Z"),
          }
        : undefined,
    },
  });
  res.send(results);
});

//to create a new flight: should be done the tickets part
//not done properly should finish all possible errors
app.post("/flights", async (req, res) => {
  const newFlight = await prisma.flight.create({
    data: {
      arrivalTime: req.body.arrivalTime,
      departureTime: req.body.departureTime,
      flightNumber: req.body.flightNumber,
      arrivesAt: req.body.arrivesAt,
      departsFrom: req.body.departsFrom,
      flyCompany: req.body.flyCompany,
      plane: req.body.plane,
    },
  });
  res.send(newFlight);
});

//to cancel a flight so change status also if it has any delays
//not done properly should finish all possible errors
app.patch("/flights/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updatedFlight = await prisma.flight.update({
    where: { id },
    data: { status: req.body.status, departureTime: req.body.departureTime },
  });
  res.send(updatedFlight);
});

//Log-in a user that already exists with it's credentials
app.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    //check for any possible error
    const errors: string[] = [];

    if (typeof email !== "string")
      errors.push("Email not provided or not a string!");

    if (typeof password !== "string")
      errors.push("Password not provided or not a string!");

    if (errors.length > 0) {
      return res.status(400).send({ errors });
    }

    //Check if they email exists on our db
    const user = await prisma.user.findUnique({ where: { email } });

    //Check if the e-mail and password match
    if (user && verify(password, user.password)) {
      const token = generateToken(user.id);
      if (user.role === "admin") {
        res.send({ user, token, isAdmin: true });
      } else {
        res.send({ user, token, isAdmin: false });
      }
    } else {
      res.status(400).send({ errors: ["Wrong credentials!"] });
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

//Create a new account for users
app.post("/sign-up", async (req, res) => {
  const { email, password, gender, age, firstName, lastName } = req.body;
  try {
    //Check if the email is already in our db
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    //Checking all possible errors
    const errors: string[] = [];
    if (typeof email !== "string")
      errors.push("Email not provided or not a string");

    if (typeof password !== "string")
      errors.push("Password not provided or not a string");

    if (typeof gender !== "string")
      errors.push("Gender not provided or not a string");

    if (typeof age !== "number")
      errors.push("Age not provided or not a number");

    if (typeof firstName !== "string")
      errors.push("First name not provided or not a string");

    if (typeof lastName !== "string")
      errors.push("Last name not provided or not a string");

    //Don't allow a user under 18 to create an account
    if (age < 18)
      errors.push("You can't create an account if you are under 18!");

    if (errors.length > 0) {
      return res.status(400).send({ errors });
    }

    //Make sure they don't create two accounts with the same email
    if (existingUser) {
      return res.status(400).send({ errors: ["User already exists!"] });
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
    res.status(400).send({ errors: [error.message] });
  }
});

app.get("/validate", async (req, res) => {
  try {
    //get the token
    const token = req.headers.authorization;
    if (token) {
      const user = await getCurrentUser(token);
      //check if there is a user with this token
      if (user) {
        const newToken = generateToken(user.id);
        //send the user with a new token
        res.send({ user, token: newToken });
      } else {
        //check all possible errors
        res.status(400).send({ errors: ["Invalid token!"] });
      }
    } else {
      res.status(400).send({ errors: ["Token not provided "] });
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.listen(port, () => {
  console.log(`App is running: http://localhost:${port}`);
});
