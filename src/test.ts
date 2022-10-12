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

// async function test2 () {
//     const date = await prisma.flight.findMany({
//       where: {
//         departureTime: {
//          toLocaleDateString: 
//         },
//       },
//     });
//     console.log(date);
//   }

// test();
