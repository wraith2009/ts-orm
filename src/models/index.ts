import "../models";

import { defineModel } from "../orm/defineModel";
import { DataTypes } from "../orm/DataTypes";

defineModel("users", {
  id: DataTypes.int({ primaryKey: true }),
  name: DataTypes.text({ nullable: false }),
  email: DataTypes.text({ unique: true }),
});

defineModel("profiles", {
  id: DataTypes.int({ primaryKey: true }),
  bio: DataTypes.text({}),
  userId: DataTypes.int({
    references: {
      table: "users",
      column: "id",
      onDelete: "CASCADE",
    },
  }),
});

// etc.

defineModel("comments", {
  id: DataTypes.int({ primaryKey: true }),
  text: DataTypes.text({ nullable: false }),
  postId: DataTypes.int({
    references: {
      table: "posts",
      column: "id",
      onDelete: "CASCADE",
    },
  }),
});
