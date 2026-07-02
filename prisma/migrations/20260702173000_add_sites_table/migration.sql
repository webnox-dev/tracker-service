-- CreateTable
CREATE TABLE "sites" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "apiKey" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'enabled',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sites_apiKey_key" ON "sites"("apiKey");
