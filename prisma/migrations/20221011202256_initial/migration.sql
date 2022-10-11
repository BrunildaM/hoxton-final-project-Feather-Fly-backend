-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User'
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "flightId" INTEGER NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" INTEGER NOT NULL,
    "seat" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'one-way',
    "status" TEXT NOT NULL DEFAULT 'available',
    "baggage" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "flightId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "Ticket_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ClassCapacity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "capacity" INTEGER NOT NULL,
    "planeId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "ClassCapacity_planeId_fkey" FOREIGN KEY ("planeId") REFERENCES "Plane" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassCapacity_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "flightNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
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

-- CreateTable
CREATE TABLE "Plane" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "capacity" INTEGER NOT NULL,
    "flyCompanyId" INTEGER NOT NULL,
    CONSTRAINT "Plane_flyCompanyId_fkey" FOREIGN KEY ("flyCompanyId") REFERENCES "FlyCompany" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlyCompany" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logo" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Airport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "location" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AirportToFlyCompany" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AirportToFlyCompany_A_fkey" FOREIGN KEY ("A") REFERENCES "Airport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AirportToFlyCompany_B_fkey" FOREIGN KEY ("B") REFERENCES "FlyCompany" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AirportToFlyCompany_AB_unique" ON "_AirportToFlyCompany"("A", "B");

-- CreateIndex
CREATE INDEX "_AirportToFlyCompany_B_index" ON "_AirportToFlyCompany"("B");
