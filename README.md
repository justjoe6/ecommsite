# Database (MongoDB)

config.js:
```
const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/e-commerce")
```
Here I import the mongoose library and connect to the local e-commerce database
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
Here I create a new Mongoose schema called productSchema.
The schema defines the fields that each product document will have:
- name: A String that stores the name of the product.
- price: A String that stores the price of the product.
- category: A String that stores the category of the product (e.g., electronics, clothing, etc.).
- userId: A String that stores the ID of the user who added or owns the product.
- company: A String that stores the company or brand associated with the product.

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
This schema defines the fields that each user document will have:
- name: A String that stores the name of the user.
- email: A String that stores the email of the user.
- password: A String that stores the password of the user.

# Backend(Node.js)

Middleware:
The first two pieces of middleware here app.use(express.json()) and app.use(cors()) are used to parse incoming requests ensuring that any JSON data in the request body is properly parsed into JavaScript objects and enabling Cross-Origin Resource Sharing (CORS), allowing the server to accept requests from different origins. Lastly, we have the middleware function verifyToken which is used to validate JWT tokens in incoming requests. It first checks if the authorization header is present in the request if it is not present then it responds with a 403 status and the "Please Provide a Token" message. If the authorization header is indeed present then if retrieves the token from the authorization header if the token is valid then next() is called passing control to the next piece of middleware, however, if the token is invalid then it responds with a 401 status and the message "Please Provide a Valid Token".
```
app.use(express.json());
app.use(cors());

function verifyToken(req,rsp,next){
  let token = req.headers["authorization"]
  if(token){
    token = token.split(" ")[1]
    Jwt.verify(token,jwtKey,(err,valid)=>{
      if(err){
        rsp.status(401).send({result:"Please Provide a Valid Token"})
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
Here I set up a POST request handler for the /register route which first creates a new instance of the User model defined above using the request body which contains a username,password, and email. Then await user.save() is called in order to save the user instance to the database and the await keyword ensures that the code waits for the saving process to finish before continuing. After deleting the password from result it returns that along with a JWT(Which expires in 2 hours) unless there is an error generating the JWT in which case it responds with the message "Something went wrong".
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
Here I set up a POST request handler for the /login route which first ensures that the user provided both an email and a password when logging in if one or both are missing then it responds with the message "No User Found". After this User.findOne(req.body) searches for a user in the database whose fields match the provided email and password. The
.select("-password") Excludes the password field from the returned user object for security reasons. If a user is found then it responds with the user object along with an authentication token that expires in two hours. Otherwise if a user is not found then it responds with the message "No User Found".
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
Similar to how users are registered here I set up the POST request handler for the /add-product route which creates a new instance of the product model defined aboe and saves it to the database and finally sends a response containing the result.
```
app.post("/add-product",verifyToken, async (req, rsp) => {
  let product = new Product(req.body);
  let result = await product.save();
  rsp.send(result);
});
```

Products Get Request:
Here I set up the GET request handler for the route /products which retrieves all products from the database using Product.find() and if the number of products is greater than 0 it sends a response containing all the products. Otherwise the response contains the message "No Products Found".
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
Here I set up the DELETE request handler for the route /product/:id which first retrieves the ID of the product to be deleted from the URL parameters it then deletes the product with the corresponding ID from the database with Product.deleteOne({ _id: id }) and responds with the result.
```
app.delete("/product/:id",verifyToken, async (req, rsp) => {
  const id = req.params.id;
  let result = await Product.deleteOne({ _id: id });
  rsp.send(result);
});
```

Get Products by ID Request:
Similar to the DELETE request handler for products here it uses the URL parameter to get the ID of the product to be retrieved from the database if that product is found a response is sent with that product otherwise the message "Product Not Found" is sent.
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
Again similar the the DELETE and GET request above here it uses the URL parameter to get the ID of the product to be updated then it uses Product.updateOne() to update the product with the corresponding ID with the updated values contained in the request body. Lastly, it responds with the result.
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
Here it uses the parameters key which contains what the user has inputted into the search box then using Product.find() it retrieves all products whose name or company or category the search matches and it responds with all those products that match.
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
Works the same as the Product Put Request except in this case we are updating a user information on the database.
```
app.put("/user/:id", async (req,rsp)=>{
  let result = await User.updateOne({_id:req.params.id},{
    $set: req.body
  })
  rsp.send(result)
});
```
