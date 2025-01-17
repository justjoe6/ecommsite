const express = require("express");
require("./db/config");
const User = require("./db/user");
const Product = require("./db/products");
const app = express();
const cors = require("cors");
const Jwt = require("jsonwebtoken")
const jwtKey = "e-commerce"

app.use(express.json());
app.use(cors());

app.post("/register", async (req, rsp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
    if(err){
      rsp.send({error:"Something went wrong"})
    }
    rsp.send({result,auth:token});
  })

});

app.post("/login",async (req, rsp) => {
  if (!req.body.email || !req.body.password) {
    rsp.send({ result: "No User Found" });
    return;
  }
  let user = await User.findOne(req.body).select("-password");

  if (user) {
    Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
      if(err){
        rsp.send({result:"Something went wrong"})
      }
      rsp.send({user,auth:token});
    })
  } else {
    rsp.send({ result: "No User Found" });
  }
});
app.post("/add-product",verifyToken, async (req, rsp) => {
  let product = new Product(req.body);
  let result = await product.save();
  rsp.send(result);
});

app.get("/products",verifyToken, async (req, rsp) => {
  let products = await Product.find();
  if (products.length > 0) {
    rsp.send(products);
  } else {
    rsp.send({ result: "No Products Found" });
  }
});
app.delete("/product/:id",verifyToken, async (req, rsp) => {
  const id = req.params.id;
  let result = await Product.deleteOne({ _id: id });
  rsp.send(result);
});

app.get("/product/:id",verifyToken, async (req, rsp) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    rsp.send(result);
  } else {
    rsp.send({ result: "Product Not Found" });
  }
});

app.put("/product/:id",verifyToken, async (req, rsp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );

  rsp.send(result);
});

app.get("/search/:key",verifyToken,async (req, rsp) => {
  let result = await Product.find({
    "$or": [
      {
        name: { $regex: req.params.key },
      },
      {
        company: { $regex: req.params.key },
      },
      {
        category: { $regex: req.params.key },
      }
    ],
  });

  rsp.send(result)
});

app.put("/user/:id", async (req,rsp)=>{
  let result = await User.updateOne({_id:req.params.id},{
    $set: req.body
  })
  rsp.send(result)
});

function verifyToken(req,rsp,next){
  let token = req.headers["authorization"]
  if(token){
    token = token.split(" ")[1]
    Jwt.verify(token,jwtKey,(err,valid)=>{
      if(err){
        rsp.status(401).send({result:"Please Provide a Token"})
      }else{
        next()
      }
    })
  }
  else{
    rsp.status(403).send({result:"Please Provide a Token"})
  }
  
}

app.listen(5000);
