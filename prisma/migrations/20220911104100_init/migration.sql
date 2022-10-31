-- CreateTable
CREATE TABLE "Todo" (
    "id" SERIAL NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "done" BOOLEAN DEFAULT false,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);
