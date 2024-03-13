const express = require("express");
const router = express.Router();
const controller = require("../controllers/Cmain");
const apiKey = "AIzaSyDlu0zaA5jg995Mm5-Lu1lJ3jEjNg25m3c";
const axios = require("axios");
const multer = require("../middleware/upload");

router.get("/", controller.open);
router.get("/login", controller.login);
router.get("/main", controller.main);
router.get("/join", controller.join);
router.get("/myPage", controller.myPage);
router.get("/post", controller.post);
router.get("/postEdit", controller.postEdit);
router.get("/profileEdit", controller.profileEdit);

router.post("/join", controller.postJoin);
router.post("/login", controller.postLogin);
router.get("/logout", controller.postLogout);
router.post("/profileEdit", controller.postProfile);
router.post("/deleteUser", controller.deleteUser);
router.post("/editUser", multer.uploadProfile.single("fileInput"), controller.editUser);
// router.post("/uploadPost", multer.uploadPostPhoto.single("postEditFile"), controller.postPost);
// router.post("/uploadPost", multer.uploadPostPhoto.single("postEditFile"), controller.putPost);

//포스트와 관련된 router설정
const postController = require("../controllers/Cpost");
router.post(
    "/writePost",
    multer.uploadPostPhoto.fields([
        { name: "file1" },
        { name: "file2" },
        { name: "file3" },
        { name: "file4" },
        { name: "file5" },
    ]),
    postController.postPost
); // 게시글 등록에 관한 api입니다. req의 body데이터로,
//{
//    "postTitle" :"임시제목",
//    "weather" : "sunny",
//    "region" : "서울",
//    "postCourse" : [{"courseImagePath" : "temp", "courseLon":12.12, "courseLat":13.13, "courseText":"course설명입니다"},{"courseImagePath" : "temp", "courseLon":12.12, "courseLat":13.13, "courseText":"course설명입니다"}]
//}와 같은 형태로 받도록 되어 있습니다.
router.get("/getPost/:postID", postController.showPost);
// 게시글 하나에 대해 글 내용과, 그 글에 달린 전체 댓글을 가져오는 api입니다. params로 postID를 받습니다.
//즉, /temp3/1 (postID=1)인글의 데이터를 읽어옵니다.

//res.body 데이터의 예시는 다음과 같습니다. ( 예시) localhost:8000/temp3/1로 접속시, 제 임시 DB에 대해 동작한 결과는 다음과 같습니다. )

// {
//     "isLogin": true,
//     "postData":{
//     "postNumber": 1,
//     "postTitle": "임시제목",
//     "weather": null,
//     "region": null,
//     "reImage": "temp",
//     "createdAt": "2024-03-06T04:59:23.000Z",
//     "updatedAt": "2024-03-06T04:59:23.000Z",
//     "userID": 1
//     },
//     "commentResult":[
//     {"courseNumber": 1, "courseImagePath": "temp", "courseLon": 12.12, "courseLat": 13.13, "courseText": "course설명입니다",…},
//     {"courseNumber": 2, "courseImagePath": "temp", "courseLon": 12.12, "courseLat": 13.13, "courseText": "course설명입니다",…}
//     ],
//     "postCourseData":[
//     {"courseNumber": 1, "courseImagePath": "temp", "courseLon": 12.12, "courseLat": 13.13, "courseText": "course설명입니다",…},
//     {"courseNumber": 2, "courseImagePath": "temp", "courseLon": 12.12, "courseLat": 13.13, "courseText": "course설명입니다",…}
//     ]
// }

router.delete("/deletePost", postController.deletePost); //삭제할 게시글의 postID(DBmodel에는 postNumber로 되어 있음)을 params로 넘기면, 권한 조회 후, 삭제함

router.get("/putPostRequest/:postID", postController.putPostRequest);
router.put(
    "/putPost/:postID",
    multer.uploadPostPhoto.single("postEditFile"),
    postController.putPost
); //이 코드는, post api /writePost와 완전 일치합니다.
// post /writePost와 같은 req.body를 작성하신 후, put api로 전송하면 됩니다.

// =================================================

//포스트의 댓글과 관련된 router 설정
const commentController = require("../controllers/Ccomment");
router.post("/postComment", commentController.postComment); // 댓글 등록에 관한 api입니다. req의 body 데이터로,
//{
//     "postNumber": 1,
//     "userID": 1,
//     "commentText": "댓글 내용입니다"const apiKey = "AIzaSyDlu0zaA5jg995Mm5-Lu1lJ3jEjNg25m3c";

router.post("/getPlaces", async (req, res) => {
    const { keyword } = req.body;

    try {
        // Google Places API를 사용하여 건물 이름과 관련된 장소 검색
        const placesResponse = await axios.get(
            "https://maps.googleapis.com/maps/api/place/textsearch/json",
            {
                params: {
                    query: keyword,
                    key: apiKey,
                },
            }
        );

        const places = placesResponse.data.results.map((place) => ({
            name: place.name,
            place_id: place.place_id,
        }));

        res.json({ places });
    } catch (error) {
        console.error("Error fetching places:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/getLatLng", async (req, res) => {
    const { placeId } = req.body;

    try {
        const geocodeResponse = await axios.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            {
                params: {
                    place_id: placeId,
                    key: apiKey,
                },
            }
        );

        const location = geocodeResponse.data.results[0].geometry.location;

        res.json({ location });
    } catch (error) {
        console.error("Error fetching location:", error.message);
        res.status(500).json({ error: "Failed to fetch location" });
    }
});
//}와 같은 형태로 받고 있습니다.

router.delete("/deleteComment", commentController.deleteComment);

// delete 로 댓글 ID(PostCommet의 PK입니다)를 params로 넣어서 전송하시면, 현재 세션의 userID와, 그 댓글 작성자의 ID를 검사후, DB에서 삭제하는 것이 아닌,

// isDeleted의 값만 바꾸게 됩니다.

module.exports = router;
