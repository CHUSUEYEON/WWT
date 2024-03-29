"use strict";

const Sequelize = require("sequelize");
console.log("crossenv", process.env.NODE_ENV); //prod or development
let config;
if (process.env.NODE_ENV) {
    // npm run dev(로컬), npm start(서버)
    config = require(__dirname + "/../config/config.json")[process.env.NODE_ENV];
} else {
    //node app.js
    config = require(__dirname + "/../config/config.json")["development"];
}

console.log("config >> ", config);
const db = {};

// Sequelize를 이용하여 sequelize 인스턴스를 생성
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const User = require("./User")(sequelize, Sequelize);
const Post = require("./Post")(sequelize, Sequelize);
const PostComment = require("./PostComment")(sequelize, Sequelize);
const PostCourse = require("./PostCourse")(sequelize, Sequelize);
// const CommentReply = require("./CommentReply")(sequelize, Sequelize);

User.hasMany(Post, { foreignKey: "userID" });
Post.belongsTo(User, { foreignKey: "userID" });

Post.hasMany(PostComment, { foreignKey: "postNumber", onDelete: "CASCADE" });
PostComment.belongsTo(Post, { foreignKey: "postNumber", onDelete: "CASCADE" });
Post.hasMany(PostCourse, { foreignKey: "postNumber", onDelete: "CASCADE" });
PostCourse.belongsTo(Post, { foreignKey: "postNumber", onDelete: "CASCADE" });
// User.hasMany(CommentReply, { foreignKey: "userID" });
// PostComment.hasMany(CommentReply, { foreignKey: "commentID" });
// CommentReply.belongsTo(User, { foreignKey: "userID" });
// CommentReply.belongsTo(PostComment, { foreignKey: "commentID" });

PostComment.hasMany(PostComment, { foreignKey: "isReply" });

User.hasMany(PostComment, { foreignKey: "userID" });
PostComment.belongsTo(User, { foreignKey: "userID" });

db.User = User;
db.Post = Post;
db.PostComment = PostComment;
db.PostCourse = PostCourse;
// db.CommentReply = CommentReply;

module.exports = db;
