-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "lastVersionCreated" TEXT NOT NULL DEFAULT '',
    "socket_id" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_tokens" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "admin_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_versions" (
    "id" SERIAL NOT NULL,
    "mantisProjectId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obsolete" BOOLEAN NOT NULL,

    CONSTRAINT "projects_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assembly_info" (
    "id" SERIAL NOT NULL,
    "projectVersionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "fdate" TIMESTAMP(3) NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "projects_versions_mantisProjectId_version_key" ON "projects_versions"("mantisProjectId", "version");

-- CreateIndex
CREATE INDEX "assembly_info_name_extension_fdate_idx" ON "assembly_info"("name", "extension", "fdate");

-- CreateIndex
CREATE UNIQUE INDEX "assembly_info_projectVersionId_path_key" ON "assembly_info"("projectVersionId", "path");

-- AddForeignKey
ALTER TABLE "assembly_info" ADD CONSTRAINT "assembly_info_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "projects_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
