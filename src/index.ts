import "./models";

import { testConnection } from "./db/connection";
import { defineModel } from "./orm/defineModel";
import { DataTypes } from "./orm/DataTypes";
import { generateCreateTableSQL } from "./orm/sqlGenerator";
import { ModelRegistry } from "./orm/ModelRegistry";
import { migrate } from "./orm/Migrate";

async function main() {
  await testConnection().catch((err) => {
    console.error("DB connection failed:", err);
  });
}
main();

async function query() {
  // console.log("\n Running CRUD + Relationship Test...\n");
  // // Cleanup
  // await User.delete({ email: "rahul@example.com" });
  // // Create user and post
  // const user = await User.create({
  //   id: 1,
  //   name: "Rahul",
  //   email: "rahul@example.com",
  // });
  // const post = await Post.create({
  //   id: 101,
  //   title: "Rahul's First Post",
  //   userId: user.id,
  // });
  // // HasMany: getUserPosts
  // const getUserPosts = User.hasMany(Post, "userId");
  // const userPosts = await getUserPosts(user.id);
  // console.log(" Posts by user:", userPosts);
  // // BelongsTo: getAuthorOfPost
  // const getAuthor = Post.belongsTo(User, "userId");
  // const author = await getAuthor(post);
  // console.log(" Author of post:", author);
  // // Update
  // await User.update({ email: "rahul@example.com" }, { name: "Updated Rahul" });
  // // Find after update
  // const updated = await User.find({ id: user.id });
  // console.log(" Updated user:", updated);
  // QueryBuilder test
  // const queryResults = await User.query()
  //   .where("name", "=", "Updated Rahul")
  //   .orderBy("id", "desc")
  //   .limit(1)
  //   .execute();
  // console.log(" QueryBuilder results:", queryResults);
  // console.log("\n All operations completed.\n");
}
// query();
