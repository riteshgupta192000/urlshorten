const express=require("express");
const app=express();
const urlRoute =require("./routes/url");
const staticRoute=require("./routes/staticRouter");
const userRoute=require("./routes/user");
const connectDb=require("./connection");
const URL = require("./models/url");
const path=require("path");
const cookieParser= require("cookie-parser");
const {checkForAuthentication,restrictTo}=require("./middlewares/auth");
const PORT=3000;



connectDb("mongodb://127.0.0.1:27017/shorturl").then(()=>{
    console.log("mongodb successfully connect");
});

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended:false}));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url",restrictTo(["NORMAL","ADMIN"]),urlRoute);
app.use("/user",userRoute);
app.use("/",staticRoute);


app.get("/test",async (req,res)=>{
    const allUrls =await URL.find({});
    return res.render("home",{
        urls:allUrls,
    })
});


app.get("/home",async (req,res)=>{
    return res.render("home");
});














app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    
    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    },
                },
            }
        );

        if (entry) {
            res.redirect(entry.redirectURL);
        } else {
            // Handle case where entry is not found
            res.status(404).send("URL not found");
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});












// app.get("/:shortId",async (req,res)=>{
//     const shortId = req.params.shortId;
//     const entry = await URL.findOneAndUpdate(
//         {
//             shortId,
//         },{
//             $push:{
//                 visitHistory: {
//                     timestamp: Date.now(),
//                 },
//             },
//         }
//     );

//     res.redirect(entry.redirectURL);

// });




app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}`);
});