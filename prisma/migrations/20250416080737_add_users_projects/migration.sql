-- CreateTable
CREATE TABLE "users_projects" (
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "lastVersionCreated" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "users_projects_user_id_project_id_key" ON "users_projects"("user_id", "project_id");

-- AddForeignKey
ALTER TABLE "users_projects" ADD CONSTRAINT "users_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
