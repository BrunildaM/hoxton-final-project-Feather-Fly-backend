import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { generateToken, getCurrentUser, hash, verify } from "./auth";
import { createTicketsForFlight } from "./helpers";

const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());
const prisma = new PrismaClient();

const port = 4000;

//Get the capitals that has the highest number of flights
app.get("/capitals", async (req, res) => {
  try {
    const capitals = await prisma.capitals.findMany();
    res.send(capitals);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

//Get all airports
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

//Create a new airport
app.post("/airports", async (req, res) => {
  try {
    const { location, name } = req.body;
    const errors: string[] = [];

    if (typeof location !== "string")
      errors.push("Location is missing or not a string");
    if (typeof name !== "string")
      errors.push("Name not provided or not a string");

    if (errors.length > 0) {
      return res.status(400).send({ errors });
    }

    const newAirport = await prisma.airport.create({
      data: {
        location,
        name,
      },
    });
    res.send(newAirport);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

//Get all flights
app.get("/flights", async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        arrivesAt: true,
        departsFrom: true,
        flyCompany: true,
        tickets: { include: { class: { include: { classCapacities: true } } } },
      },
    });
    res.send(flights);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});


//trying to get tickets
app.get("/flights/:departure/:arrival/:time",async(req,res)=>{
  const flights=await prisma.flight.findMany({
    where:{
    departsFrom:{location:{contains:req.params.departure}},
    arrivesAt:{location:{contains:req.params.arrival}},
    departureTime:{gte: new Date(req.params.time)}
    },
    select:{departsFrom:true,arrivalTime:true,arrivesAt:true}
    }) 
 if(flights.length!==0) res.send(flights)
 else res.status(400).send({message:`There is no flight from ${req.params.departure} to ${req.params.arrival} at this date ${req.params.time}`})
})

//Getting flights by location of arrival or departure and time
app.post("/search", async (req, res) => {
  const { departs, arrives, date } = req.body;

  const results = await prisma.flight.findMany({
    where: {
      // tickets: {every: {class: {name: {contains: class}}}}

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
  try {
    const { arrivalTime, departureTime, flightNumber } = req.body;
    const newFlight = await prisma.flight.create({
      data: {
        arrivalTime,
        departureTime,
        flightNumber,
        departsFrom: {
          connectOrCreate: {
            where: { id: Number(req.body.id) },
            create: { location: req.body.location, name: req.body.location },
          },
        },
        arrivesAt: {
          connectOrCreate: {
            where: { id: Number(req.body.id) },
            create: { location: req.body.location, name: req.body.location },
          },
        },
        flyCompany: {
          connectOrCreate: {
            where: { id: Number(req.body.id) },
            create: { logo: req.body.logo, name: req.body.name },
          },
        },
        plane: {
          connectOrCreate: {
            where: { id: Number(req.body.id) },
            create: {
              capacity: req.body.capacity,
              classCapacities: req.body.classCapacities,
              flyCompany: { connect: { id: Number(req.body.id) } },
            },
          },
        },
      },
    });
    res.send(newFlight);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

//to cancel a flight so change status also if it has any delays
//not done properly should finish all possible errors
app.patch("/flights/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id) {
      const updatedFlight = await prisma.flight.update({
        where: { id },
        data: {
          status: req.body.status,
          departureTime: req.body.departureTime,
        },
      });
      res.send(updatedFlight);
    } else {
      res.status(404).send("Flight not found!");
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/passengers", async (req, res) => {
  try {
    const passangers = await prisma.passanger.findMany();
    res.send(passangers);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

//create passengers
app.post("/passengers", async (req, res) => {
  try {
    const { age, firstName, gender, lastName } = req.body;
    const passenger = await prisma.passanger.create({
      data: { age, firstName, gender, lastName },
    });
    res.send(passenger);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

//to delete a passenger
app.delete("/passengers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id) {
      const deletedPassenger = await prisma.passanger.delete({ where: { id } });
      res.send({ message: "Passenger deleted" });
    } else {
      res.status(404).send("Passenger not found");
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});


//Get all tickets for a specific flight
app.get("/tickets", async (req, res) => {
  const flight = await prisma.flight.findUnique({where: {id: Number(req.body.id)}})
})

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
