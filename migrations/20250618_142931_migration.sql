CREATE TABLE IF NOT EXISTS "comments" (
  "id" INTEGER PRIMARY KEY,
  "text" TEXT NOT NULL,
  "postId" INTEGER REFERENCES "posts"("id")ON DELETE CASCADE
);
