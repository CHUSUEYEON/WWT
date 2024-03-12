const model = require("../models");
const path = require("path");
const id = 1;
exports.postPost = (req, res) => {
    console.log("hi!!");
    console.log("req.file");
    console.log(req.files);
    // console.log("-----------", req.session);

    if (req.session.userID) {
        console.log(req.body.postTitle);
        console.log(req.session.data);
        const title = req.body.postTitle;
        const weather = req.body.weather;
        const region = req.body.region;
        const postCourseList = JSON.parse(req.body.postCourse);

        console.log("postCourseList type", typeof postCourseList);

        // console.log(req.file);
        console.log("req.body-=-----");
        console.log(req.body);
        console.log("==========================");
        console.log(req.files);
        console.log("==========================");
        console.log(req.files.file1);
        console.log("==========================");
        console.log(req.files.file1[0].path);
        model.Post.create({
            userID: req.session.data.id,
            postTitle: title,
            weather: weather,
            region: region,
            reImage: req.files.file1[0].path,
            // reImage: postCourseList[0].courseImagePath, // 글 불러오기를 위해 대표 이미지로 가장 첫 코스의 이미지를 가져오도록
        })
            .then((result) => {
                console.log("-----postCourse----------");
                console.log(postCourseList[0]);
                const { file1, file2, file3, file4, file5 } = req.files;
                let temp = [file1, file2, file3, file4, file5];
                for (let i = 0; i < postCourseList.length; i++) {
                    model.PostCourse.create({
                        postNumber: result.postNumber,
                        courseImagePath: temp[i][0].path,
                        // courseImagePath:req.files.file${i}[0].path,
                        // courseImagePath: req.files[`file${i}`][0].path,
                        courseLon: postCourseList[i].courseLon,
                        courseLat: postCourseList[i].courseLat,
                        courseText: postCourseList[i].courseText,
                    });
                }
                res.redirect(`/getPost/${result.postNumber}`);
            })
            .catch((error) => {
                console.error("데이터베이스 작업 중 오류:", error);
                res.status(500).send("내부 서버 오류");
            });
    } else {
        res.status(401).send("세션이 유효하지 않습니다");
        //세션이 유효하지 않는다는 페이지로 수정해야함!!
    }
};

exports.showPost = (req, res) => {
    const isLogin = req.session.userID ? true : false;
    const PostNumber = req.params.postID;

    model.Post.findOne({
        where: {
            postNumber: PostNumber,
        },
        include: [{ model: model.User }],
    }).then((postData) => {
        model.PostCourse.findAll({
            where: {
                postNumber: PostNumber,
            },
        })
            .then((postCourseData) => {
                model.PostComment.findAll({
                    where: {
                        postNumber: PostNumber,
                    },
                })
                    .then((commentResult) => {
                        const getUserNicknamePromises = commentResult.map((comment) => {
                            const CommentUserID = comment.userID;
                            return model.User.findOne({
                                attributes: ["userNickname"],
                                where: {
                                    id: CommentUserID,
                                },
                            });
                        });

                        Promise.all(getUserNicknamePromises)
                            .then((userNicknames) => {
                                userNicknames.forEach((userNickname, index) => {
                                    commentResult[index].userNickname = userNickname.userNickname;
                                });

                                if (isLogin) {
                                    // console.log("내가 원하는데이터", commentResult[0].userNickname);
                                    res.render("post", {
                                        isLogin: isLogin,
                                        postData: postData,
                                        commentResult: commentResult,
                                        postCourseData: postCourseData,
                                        data: req.session.data,
                                    });
                                } else {
                                    // console.log("내가 원하는데이터", commentResult[0].userNickname);
                                    // res.render("post", {
                                    //     isLogin: isLogin,
                                    //     postData: postData,
                                    //     commentResult: commentResult,
                                    //     postCourseData: postCourseData,
                                    // });
                                    res.render("post", {
                                        isLogin: isLogin,
                                        postData: postData,
                                        commentResult: commentResult,
                                        postCourseData: postCourseData,
                                    });
                                }
                            })
                            .catch((getUserNicknameErr) => {
                                console.error("Error fetching user nicknames:", getUserNicknameErr);
                                res.status(500).send("Internal Server Error");
                            });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send("Internal Server Error");
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send("Internal Server Error");
            });
    });
};

exports.deletePost = (req, res) => {
    console.log("**********************", req.body);
    if (!req.session.data) {
        res.send("게시글을 삭제할 권한이 없습니다!");
    } else {
        const CURRENTUSER = req.session.data.id;
        const postNumber = req.body.postNumber;
        model.Post.findOne({
            where: {
                postNumber: postNumber,
            },
        })
            .then((result) => {
                if (result.userID === CURRENTUSER) {
                    model.Post.destroy({
                        where: {
                            postNumber: postNumber,
                        },
                    })
                        .then(() => {
                            res.send("삭제 완료!");
                            //res.redirect('/');
                        })
                        .catch((err) => {
                            console.log("데이터를 삭제하는 중 에러가 발생했습니다", err);
                        });
                }
            })
            .catch((err) => {
                console.log("params로 전달한 ID로 조회중, 오류가 발생했습니다!", err);
            });
    }
};

exports.putPostRequest = (req, res) => {
    const PostNumber = req.params.postID;

    if (!req.session.data) {
        res.send("수정할 권한이 없습니다! 로그인 해주세요");
    } else {
        const CURRENTUSER = req.session.data.id;
        model.Post.findOne({
            where: {
                postNumber: PostNumber,
            },
        }).then((postResult) => {
            if (CURRENTUSER === postResult.userID) {
                model.PostCourse.findAll({
                    where: {
                        postNumber: PostNumber,
                    },
                })
                    .then((courseResult) => {
                        // res.render("postEdit", {
                        //     postResult: postResult,
                        //     courseResult: courseResult,
                        //     isLogin: true,
                        // });
                        res.render("postEdit", {
                            isLogin: true,
                            isModify: true,
                            postResult: postResult,
                            courseResult: courseResult,
                            data: req.session.data,
                        });
                    })
                    .catch((err) => {
                        console.log("course를 조회하다 오류가 발생", err);
                    });
            } else {
                res.send("권한 없음");
            }
        });
    }
};

exports.putPost = async (req, res) => {
    const PostNumber = req.params.postID;

    if (!req.session.data) {
        res.send("세션이 만료되었습니다. 다시 로그인 해주세요");
    } else {
        const title = req.body.postTitle;
        const weather = req.body.weather;
        const region = req.body.region;
        const postCourseList = req.body.postCourse;

        try {
            await model.Post.update(
                {
                    postTitle: title,
                    weather: weather,
                    region: region,
                    //reImage: req.file.path,
                },
                {
                    where: {
                        postNumber: PostNumber,
                    },
                }
            );

            for (let i = 0; i < postCourseList.length; i++) {
                await model.PostCourse.update(
                    {
                        courseText: postCourseList[i].courseText,
                    },
                    {
                        where: {
                            courseNumber: postCourseList[i].courseNumber,
                        },
                    }
                );
            }

            // 모든 업데이트가 완료된 후에 응답을 보냄
            res.send("게시물이 성공적으로 업데이트되었습니다.");
        } catch (error) {
            // 오류 발생 시 오류 메시지를 응답으로 보냄
            console.error(error);
            res.status(500).send("서버 오류 발생");
        }
    }
};
exports.writePost = (req, res) => {
    // uploadDetail 미들웨어로 파일 업로드 처리 후 요청 처리
    upload.single("postEditFile")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // multer에서 발생한 오류 처리
            return res.status(500).json({ error: "Multer error occurred" });
        } else if (err) {
            // 기타 오류 처리
            return res.status(500).json({ error: "Unknown error occurred" });
        }

        return res.json({ message: "File uploaded successfully" });
    });
};
