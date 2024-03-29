const PostCommentModel = (sequelize, DataTypes) => {
    const PostComment = sequelize.define(
        "PostComment",
        {
            commentID: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            commentText: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            // isReply: {
            //     type: DataTypes.INTEGER,
            //     allowNull: true,
            //     references: {
            //         model: "PostComment",
            //         key: "commentID",
            //     },
            // },
        },
        {
            tableName: "PostComment",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return PostComment;
};

module.exports = PostCommentModel;
