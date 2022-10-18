import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const date = await prisma.flight.findMany({
    where: {
      departureTime: {
        gte: new Date("2022-10-15 00:00:00"),
        lte: new Date("2022-10-15 23:59:59"),
      },
    },
  });
  console.log(date);
}

export async function createTicketsForFlight(
  flightId: number,
  basePrice: number,
  baseBaggage: number
) {
  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
    include: {
      plane: { include: { classCapacities: { include: { class: true } } } },
    },
  });

  if (flight === null) return;

  const details = {
    "Economy class": { price: basePrice, baggage: baseBaggage },
    "Business class": { price: basePrice * 2, baggage: baseBaggage * 2 },
    "First class": { price: basePrice * 4, baggage: baseBaggage * 3 },
  };

  let currentSeat = 1;

  for (const classCapacity of flight.plane.classCapacities) {
    for (let i = 0; i < classCapacity.capacity; i++) {
      await prisma.ticket.create({
        data: {
          // @ts-ignore
          baggage: details[classCapacity.class.name].baggage.toString(),
          // @ts-ignore
          price: details[classCapacity.class.name].price,
          seat: (currentSeat++).toString(),
          classId: classCapacity.classId,
          flightId: flight.id,
        },
      });
    }
  }
}

createTicketsForFlight(2, 400, 30);
