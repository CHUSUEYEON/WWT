const model = require("../models");
const path = require("path");
const uID = 1;
const pN = 3;

exports.postComment = (req, res) => {
    // console.log(req.body.postNumber);
    if (req.session.userID) {
        console.log("=========");
        console.log(req.body);
        console.log("=========");
        model.PostComment.create({
            postNumber: req.body.postNumber,
            userID: req.body.userID,
            commentText: req.body.commentText,
            isReply: req.body.isReply, //isReply는 postCommet 모델에서, 대댓글을 의미하는 것으로 ,
            //몇번쨰 댓글(commetID)에 대한 답글인지를 가지고 있는 데이터 입니다. isReply는 commentID(commet 모델의 PK)를 외래키로 가지는 값입니다.
        }).then((result) => {
            console.log(result);
            res.send("OKd");
        });
    } else {
        res.send("유효하지 않는 세션");
        //세션이 유효하지 않는다는 페이지로 수정해야함!!
    }
};

exports.deleteComment = (req, res) => {
    const COMMENTID = req.body.commentID;
    console.log(COMMENTID == "7");
    if (!req.session.data) {
        res.send("권한이 없습니다!");
    } else {
        model.PostComment.findOne({
            where: {
                commentID: COMMENTID,
            },
        })
            .then((findResult) => {
                console.log("=====");
                console.log(findResult);
                console.log(req.session.data.id);
                console.log(findResult.userID);
                if (req.session.data.id !== findResult.userID) {
                    res.send({ isSuccess: false });
                } else {
                    model.PostComment.update(
                        {
                            isDeleted: true,
                        },
                        {
                            where: {
                                commentID: COMMENTID,
                            },
                        }
                    )
                        .then(() => {
                            res.send("성공");
                            res.send({ isSuccess: true });
                        })
                        .catch((err) => {
                            console.log(
                                "게시글 댓글에 대해 2번째로 DB조회하다 오류가 발생했습니다!",
                                err
                            );
                            res.send({ isSuccess: false });
                        });
                }
            })
            .catch((err) => {
                console.log("게시글 댓글에 대해 DB조회하다 오류가 발생했습니다!", err);
                res.send({ isSuccess: false });
            });
    }
};
