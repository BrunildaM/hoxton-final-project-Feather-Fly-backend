/*
  Warnings:

  - You are about to drop the column `type` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Flight` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Passanger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    CONSTRAINT "Passanger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" INTEGER NOT NULL,
    "seat" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "baggage" TEXT NOT NULL,
    "bookingId" INTEGER,
    "flightId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "Ticket_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("baggage", "bookingId", "classId", "flightId", "id", "price", "seat", "status") SELECT "baggage", "bookingId", "classId", "flightId", "id", "price", "seat", "status" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE TABLE "new_Flight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "flightNumber" TEXT NOT NULL,
    "departureTime" DATETIME NOT NULL,
    "arrivalTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OK',
    "flyCompanyId" INTEGER NOT NULL,
    "departureFlightId" INTEGER NOT NULL,
    "arrivalFlightId" INTEGER NOT NULL,
    "planeId" INTEGER NOT NULL,
    CONSTRAINT "Flight_departureFlightId_fkey" FOREIGN KEY ("departureFlightId") REFERENCES "Airport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Flight_arrivalFlightId_fkey" FOREIGN KEY ("arrivalFlightId") REFERENCES "Airport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Flight_flyCompanyId_fkey" FOREIGN KEY ("flyCompanyId") REFERENCES "FlyCompany" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Flight_planeId_fkey" FOREIGN KEY ("planeId") REFERENCES "Plane" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Flight" ("arrivalFlightId", "arrivalTime", "departureFlightId", "departureTime", "flightNumber", "flyCompanyId", "id", "planeId", "status") SELECT "arrivalFlightId", "arrivalTime", "departureFlightId", "departureTime", "flightNumber", "flyCompanyId", "id", "planeId", "status" FROM "Flight";
DROP TABLE "Flight";
ALTER TABLE "new_Flight" RENAME TO "Flight";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
