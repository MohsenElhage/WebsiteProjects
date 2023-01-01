const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_TOKEN } = require("../config");
const path = require("path");
// const { route } = require("express/lib/application");
const ArtWork = mongoose.model("ArtWork");
router.post("/register", (req, res) => {
  const { name, password } = req.body;
  console.log(name, password);
  if (!name || !password) {
    res.status(422).json({ error: "All fields are required" });
  }
  User.findOne({ name: name })
    .then((saveduser) => {
      if (saveduser) {
        res.json({ message: "already name exists", status: 204 });
      } else {
        bcrypt.hash(password, 12).then((hashpaswd) => {
          const user = new User({
            name,
            password: hashpaswd,
            role: "patron",
          });
          user
            .save()
            .then((user) =>
              res.json({
                message: "registered signup",
                success: true,
                status: 200,
              })
            )
            .catch((error) => {
              res.json({ status: 400, error });
            });
        });
      }
    })
    .catch((error) => {
      res.send(error);
    });
});
router.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "signup.html"));
});
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "login.html"));
});
router.get("/uploadwork", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "uploadwork.html"));
});
router.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "home.html"));
});
router.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "search.html"));
});
router.get("/user/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "user.html"));
});
router.get("/other/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "otheruser.html"));
});
router.get("/myfollowing", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "following.html"));
});
// signin route
router.post("/sign-in", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(422).json({ error: "All fields are requird" });
  } else {
    User.findOne({ name: name })
      .then((savedUser) => {
        if (!savedUser) {
          res.json({ error: "wrong name and password", success: false });
        } else {
          bcrypt
            .compare(password, savedUser.password)
            .then((authpass) => {
              if (authpass) {
                const token = jwt.sign({ _id: savedUser._id }, JWT_TOKEN);
                const { _id, name, email, role, followers, following } =
                  savedUser;
                res.json({
                  token: token,
                  user: { _id, name, email, role, followers, following },
                  success: true,
                });
              } else {
                res.json({
                  error: "invalid passowrd and name",
                  success: false,
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

router.post("/update-role", async (req, res) => {
  const { name, role } = req.body;
  let doc = await User.findOneAndUpdate(
    { name },
    { role },
    {
      new: true,
    }
  );
  res.json({ doc });
});

// upload artwork
router.post("/artwork", (req, res) => {
  const { name, medium, category, description, image, year, postBy, artist } =
    req.body;
  ArtWork.findOne({ name: name }).then((savedWork) => {
    if (savedWork) {
      res.json({ error: "Change name of the artwork :Already exist" });
    } else {
      if (
        !name ||
        !medium ||
        !category ||
        !description ||
        !image ||
        !year ||
        !postBy ||
        !artist
      ) {
        res.status(422).json({ error: "All fields are required" });
      } else {
        const post = new ArtWork({
          image,
          description,
          medium,
          year,
          postBy,
          name,
          category,
          artist,
        });
        post
          .save()
          .then((data) => {
            res.json({ post: data });
          })
          .catch((error) => {
            res.json({ error: error });
          });
      }
    }
  });
});
router.post("/mywork", (req, res) => {
  ArtWork.find({ artist: req.body.artist })
    .then((posts) => {
      res.json(posts);
      console.log(posts);
    })
    .catch((error) => {
      console.log(error);
    });
});
// like the artwork
router.post("/like", (req, res) => {
  ArtWork.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.body.Id },
    },
    {
      new: true,
    }
  )
    .populate("postBy", "_id name")
    .exec((erorr, result) => {
      if (erorr) {
        console.log(erorr);
      } else {
        res.json({ message: result });
      }
    });
});
// unlike the artwork
router.put("/unlike", (req, res) => {
  ArtWork.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.body.Id },
    },
    {
      new: true,
    }
  )
    .populate("postBy", "_id name")
    .exec((erorr, result) => {
      if (erorr) {
        console.log(erorr);
      } else {
        console.log(result, "unlike");
        res.json({ message: result });
      }
    });
});
// searching
router.post("/searchtext", async (req, res) => {
  const word = await ArtWork.find({
    $or: [
      {
        name: { $regex: req.body.word, $options: "i" },
      },
      {
        artist: { $regex: req.body.word, $options: "i" },
      },
      {
        category: { $regex: req.body.word, $options: "i" },
      },
    ],
  }).catch((error) => {
    console.log(error);
  });

  console.log(word);
  res.json(word);
});
router.post("/userartwork", (req, res) => {
  console.log(req.body.Id);
  ArtWork.findById(req.body.Id, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      console.log(result);
      const {
        image,
        name,
        artist,
        category,
        medium,
        description,
        likes,
        postBy,
        Reviews,
        _id,
        year,
      } = result;
      res.json({
        image,
        name,
        artist,
        category,
        medium,
        description,
        Reviews,
        likes,
        postBy,
        _id,
        year,
      });
    }
  });
});

router.post("/comment", (req, res) => {
  const { text, postedBy, name, artworkId } = req.body;
  const comment = {
    text,
    postedBy,
    name,
  };
  ArtWork.findByIdAndUpdate(
    artworkId,
    {
      $push: { Reviews: comment },
    },
    {
      new: true,
    }
  )
    .populate("Reviews.postedBy postBy", "name _id")
    .exec((erorr, result) => {
      if (erorr) {
        console.log(erorr);
      } else {
        res.json(result);
      }
    });
});
router.put("/userworks", (req, res) => {
  console.log(req.body.Id);
  ArtWork.find({ postBy: req.body.Id })
    .populate("postBy", "_id name")
    .then((artworks) => {
      res.json(artworks);
    })
    .catch((error) => {
      console.log(error);
    });
});
// routes to follow and unfollow the user
router.put("/follow", (req, resp) => {
  var data;
  const { tofollow, byfollow } = req.body;
  User.findByIdAndUpdate(
    tofollow,
    {
      $push: { followers: byfollow },
    },
    {
      new: true,
    }
  ).exec((error) => {
    if (error) {
      console.log(error);
    }
  });
  User.findByIdAndUpdate(
    byfollow,
    {
      $push: { following: tofollow },
    },
    {
      new: true,
    }
  )
    .select("-password")
    .exec((error, result) => {
      if (error) {
        console.log(error);
      } else {
        resp.json(result);
      }
    });
});
router.put("/unfollow", (req, resp) => {
  const { tofollow, byfollow } = req.body;
  User.findByIdAndUpdate(
    tofollow,
    {
      $pull: { followers: byfollow },
    },
    {
      new: true,
    }
  ).exec((error) => {
    if (error) {
      console.log(error);
    }
  });
  User.findByIdAndUpdate(
    byfollow,
    {
      $pull: { following: tofollow },
    },
    {
      new: true,
    }
  )
    .select("-password")
    .exec((error, result) => {
      if (error) {
        console.log(error);
      } else {
        resp.json(result);
      }
    });
});
// to get our followers
router.post("/user", async (req, resp) => {
  var totalposts = [];
  console.log(req.body.following);
  req.body.following.map((elem) => {
    User.findById(elem, async (err, result) => {
      // console.log(result)
      if (err) {
        resp.json(err);
      } else {
        const { name, _id } = await result;
        totalposts.push({ name, _id });
        console.log(totalposts);
      }
      if (req.body.following.length === totalposts.length) {
        console.log(totalposts);
        resp.json(totalposts);
      }
    });
  });
});

router.get("/upload-static-data", async (req, res) => {
const arrayToUpload = [
  {
    name: "Air meets Water",
    artist: "Corrine Hunt",
    year: "2017",
    category: "sculpture",
    medium: "wood",
    description:
      "Base of a cedar wood plank, carved with additional inlaid composite created from aluminium, animal bone ash and graphite. Three vertical carved cedar wood scultpures on steel dowelling pedestals, two are painted. Three vertical sculptures include carved representations of a raven, eagle, orca with coppers in beak of raven and copper wings on the eagle.",
    image:
      "https://media.britishmuseum.org/media/Repository/Documents/2017_12/15_11/4658c788_f74c_4fb1_a1e2_a84a00c28669/mid_ENA3371__a_.jpg",
  },
  {
    name: "Kaleidoscope eye",
    artist: "Luke",
    year: "2020",
    category: "technolgy",
    medium: "digital painting",
    description: "Kaleidoscope eye painting by Luke & Morgan Choice/AvantForm",
    image:
      "https://as2.ftcdn.net/v2/jpg/03/79/95/29/1000_F_379952985_wQ0CBLYX2NF38C4ls7pYpOtx5l7LlgUY.jpg",
  },
  {
    name: "Independence Monument",
    artist: "Anatoliy Kushch",
    year: "2001",
    category: "monument",
    medium: "bronze",
    description:
      "The Independence Monument is a victory column located on Maidan Nezalezhnosti (Independence Square) in Kyiv, commemorating the independence of Ukraine in 1991. A spiral staircase is contained within the column",
    image:
      "https://img.freepik.com/premium-photo/aerial-view-kyiv-ukraine-maidan-nezalezhnosti-independence-monument_536604-3873.jpg?w=2000",
  },
  {
    name: "Dancing in the street",
    artist: "Lea Roche",
    year: "2022",
    category: "painting",
    medium: "acrylic",
    description:
      "Fusion of artistic works (hand painting, Indian inks and acrylic painting + digital work, texture varnish ...) creating unique, matte and glossy texture effects.",
    image:
      "https://www.artmajeur.com/medias/standard/l/-/l-roche/artwork/16196815_dancing-in-the-street-80x50.jpg",
  },
  {
    name: "Hearts and a Watercolor",
    artist: "Jim Dine",
    year: "1969",
    category: "painting",
    medium: "watercolour",
    description:
      "Eight hearts with various decorations. 1969 Etching and watercolour on Chrisbrook handmade paper",
    image:
      "https://media.britishmuseum.org/media/Repository/Documents/2015_1/16_8/67ae2ec1_8646_44e8_aa15_a4220094219c/mid_PPA420678.jpg",
  },
  {
    name: "Untitled (O'Ryan)",
    artist: "Shari Hatt",
    year: "2001",
    category: "photography",
    medium: "photograph",
    description: "Materials: chromogenic print (Fujicolor)",
    image:
      "https://www.gallery.ca/sites/default/files/styles/ngc_scale_1200/public/8442158_0.jpg?itok=Q_PwLOKk&timestamp=1632405844",
  },
  {
    name: "Courage My Love",
    artist: "Sebastian McKinnon",
    year: "2015",
    category: "illustration",
    medium: "midex media",
    description:
      "Moon's Daughter had never been so far from home; she wished for glimpses of her father's crescent smile. 'Courage, my love.' said Fox, 'Even in shadow, I see pockets of moonlight in your eyes'. Story excerpt from 'Courage, My Love' by Liam McKinnon.",
    image:
      "https://cdn.shopify.com/s/files/1/0172/7018/files/courage5.jpg?5845794268734385417",
  },
  {
    name: "Hedgehog",
    artist: "Kimika Hara",
    year: "2012",
    category: "embroidery",
    medium: "needlework",
    description: "Fantastic use of sequins",
    image:
      "https://i.pinimg.com/564x/d2/1a/57/d21a5748cad55f87130d0533246d26b4.jpg",
  },
  {
    name: "Rhapsody",
    artist: "Keith Mallett",
    year: "2010",
    category: "Painting",
    medium: "Etching",
    description: "Rhapsody artist proof etching by Keith Mallett",
    image:
      "https://static.wixstatic.com/media/cdd51a_a5b97cfb6b3e4d11bac830d82cc7e947~mv2.jpg/v1/fill/w_320,h_320,fp_0.56_0.26,q_90/cdd51a_a5b97cfb6b3e4d11bac830d82cc7e947~mv2.jpg",
  },
  {
    name: "Tiny bunny love",
    artist: "ArtMind",
    year: "2011",
    category: "DIY",
    medium: "clay",
    description:
      "Clay bunnies. They make me smile, and you? Happy coding everyone!",
    image:
      "http://3.bp.blogspot.com/-h6SoSxCBinQ/Tk-HXL5dkJI/AAAAAAAAG9o/kUHTg7aIWx0/s1600/DSC07880.JPG",
  },
];


  arrayToUpload.forEach(async (obj) => {
    const { name, medium, category, description, image, year, postBy, artist } =
      obj;
    const post = new ArtWork({
      image,
      description,
      medium,
      year,
      postBy,
      name,
      category,
      artist,
    });
    await post
      .save()
      .then((data) => {
        res.json({ post: data });
      })
      .catch((error) => {
        res.json({ error: error });
      });
  });
  res.send("Data uploaded")
});
module.exports = router;
