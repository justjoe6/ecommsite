# Database (MongoDB)

config.js:
```
const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/e-commerce")
```

products.js:
```
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name:String,
    price:String,
    category:String,
    userId:String,
    company:String
})

module.exports = mongoose.model("products",productSchema)
```

user.js:
```
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

module.exports = mongoose.model("users",userSchema)
```

# Backend

Middleware:
```
app.use(express.json());
app.use(cors());

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
```

Register Post Request:
```
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
```

Login Post Request:
```
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
```

Add Product Post Request:
```
app.post("/add-product",verifyToken, async (req, rsp) => {
  let product = new Product(req.body);
  let result = await product.save();
  rsp.send(result);
});
```

Products Get Request:
```
app.get("/products",verifyToken, async (req, rsp) => {
  let products = await Product.find();
  if (products.length > 0) {
    rsp.send(products);
  } else {
    rsp.send({ result: "No Products Found" });
  }
});
```

Delete Products by ID Request:
```
app.delete("/product/:id",verifyToken, async (req, rsp) => {
  const id = req.params.id;
  let result = await Product.deleteOne({ _id: id });
  rsp.send(result);
});
```

Get Products by ID Request:
```
app.get("/product/:id",verifyToken, async (req, rsp) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    rsp.send(result);
  } else {
    rsp.send({ result: "Product Not Found" });
  }
});
```

Product Put Request:
```
app.put("/product/:id",verifyToken, async (req, rsp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );

  rsp.send(result);
});
```

Search Products Get Request:
```
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
```

User Put Request:
```
app.put("/user/:id", async (req,rsp)=>{
  let result = await User.updateOne({_id:req.params.id},{
    $set: req.body
  })
  rsp.send(result)
});
```
