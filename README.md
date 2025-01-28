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

# Frontend(React)

PrivateComponent.js:
```
const PrivateComponent = () => {
    const auth = localStorage.getItem("user")
    
    return auth ? <Outlet/> : <Navigate to="signup"/>
}
```

App.js:
```
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Nav/>
        <Routes>
          <Route element={<PrivateComponent/>}>
            <Route path="/" element={<Products/>}/>
            <Route path="/add" element={<AddProduct/>}/>
            <Route path="/update/:id" element={<UpdateProduct/>}/>
            <Route path="/logout" element={<h1>Logout Component</h1>}/>
            <Route path="/profile/:id" element={<Profile/>}/>
          </Route>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </BrowserRouter>
      <Footer/>
    </div>
  );
}
```

Nav.js:
```
const Nav = () => {
    const auth = localStorage.getItem("user")
    const navigate = useNavigate()
    const logout = () => {
        localStorage.clear()
        navigate("/signup")
    }
    return (
        <div>
            <ul className='nav-ul'>
                {auth && <>
                <li style={{color:"white"}}>Raabery</li>
                <li><Link to="/">Products</Link></li>
                <li><Link to="/add">Add Products</Link></li>
                <li><Link to={"/profile/"+JSON.parse(auth)._id}>Profile</Link></li></>}
                {auth ? <li><Link onClick={logout} to="/signup">Logout ({JSON.parse(auth).name})</Link></li> : 
                <><li> <Link to="/login">Login</Link></li><li><Link to="/signup">SignUp</Link></li></>}
            </ul>
        </div>
    )
}
```

Signup.js:
```
const Signup = () => {
    const [name,setName]=useState("")
    const [password,setPassword]=useState("")
    const [email,setEmail]=useState("")
    const navigate = useNavigate()
    useEffect(()=>{
        const auth = localStorage.getItem("user")
        if(auth){
            navigate("/")
        }
    },[])

    const collectData = async () => {
        let result = await fetch("http://localhost:5000/register",{
            method:"post",
            body:JSON.stringify({name,email,password}),
            headers:{
                "content-type":"application/json"
            }

        })
        result = await result.json()
        console.log(result)
        localStorage.setItem("user",JSON.stringify(result.result))
        localStorage.setItem("token",JSON.stringify(result.auth))
        navigate("/")
    }

    return (
        <div className="register">
            <h1>Register</h1>
            <input className="input-box" type="text" placeholder="Enter Name" value={name} onChange={(e)=>setName(e.target.value)}></input>
            <input className="input-box" type="email" placeholder="Enter Email" value={email} onChange={(e)=>setEmail(e.target.value)}></input>
            <input className="input-box"  type="password" placeholder="Enter Password" value={password} onChange={(e)=>setPassword(e.target.value)}></input>
            <button onClick={collectData} className="signup-btn" type="button">Sign up</button>
        </div>
    )
}

```

Login.js:
```
const Login = () => {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const navigate = useNavigate()


    useEffect(()=>{
        const auth = localStorage.getItem("user")
        if(auth){
            navigate("/")
        }
    },[])

    const handleLogin = async () => {
        let result = await fetch("http://localhost:5000/login",{
            method:"post",
            body:JSON.stringify({email,password}),
            headers:{"Content-Type":"application/json"}
        })
        result = await result.json()
        if(result.auth){
            localStorage.setItem("user",JSON.stringify(result.user))
            localStorage.setItem("token",JSON.stringify(result.auth))
            navigate("/")
        }   
        else{
            alert("Please enter correct details")
        }
    }

    return (
        <div className="login">
            <h1>Login</h1>
            <input onChange={(e)=>setEmail(e.target.value)} className="input-box" type="text" placeholder="Enter Email"/>
            <input onChange={(e)=>setPassword(e.target.value)} className="input-box" type="password" placeholder="Enter Password"/>
            <button onClick={handleLogin} type="button" className="signup-btn">Login</button>
        </div>
    )
}
```

AddProduct.js:
```
const AddProduct = () => {
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [category,setCategory] = useState("")
    const [company,setCompany] = useState("")
    const [error,setError] = useState(false)

    const addProducts = async ()=>{
        if(!name || !price || !category || !company){
            setError(true)
            return 
        }
        console.log(name,price,category,company)
        const userId = JSON.parse(localStorage.getItem("user"))._id
        let result = await fetch("http://localhost:5000/add-product",{
            method:"post",
            body:JSON.stringify({name,price,category,company,userId}),
            headers:{"Content-Type":"application/json",
                authorization:"bearer "+JSON.parse(localStorage.getItem("token"))
            }
        })
        result = result.json()
        setName("")
        setPrice("")
        setCategory("")
        setCompany("")
        alert("Product Added")
        console.log(result)
    }

    return (
        <div className="product">
            <h1>Add Product</h1>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="input-box" type="text" placeholder="Enter product name"/>
            {error && !name && <span style={{color:"red",marginTop:"-10px",marginLeft:"-200px"}}>Enter valid name</span>}
            <input value={price} onChange={(e)=>setPrice(e.target.value)} className="input-box" type="text" placeholder="Enter product price"/>
            {error && !price && <span style={{color:"red",marginTop:"-10px",marginLeft:"-200px"}}>Enter valid price</span>}
            <input value={category} onChange={(e)=>setCategory(e.target.value)} className="input-box" type="text" placeholder="Enter product category"/>
            {error && !category && <span style={{color:"red",marginTop:"-10px",marginLeft:"-180px"}}>Enter valid category</span>}
            <input value={company} onChange={(e)=>setCompany(e.target.value)} className="input-box" type="text" placeholder="Enter product company"/>
            {error && !company && <span style={{color:"red",marginTop:"-10px",marginLeft:"-170px"}}>Enter valid company</span>}
            <button onClick={addProducts} className="signup-btn" type="button">Add Product</button>
        </div>
    )
}
```

Products.js:
```
const Products = () => {
    const [products,setProducts] = useState([])
    const loadProducts = async () => {
        let prods = await fetch("http://localhost:5000/products",{
            headers:{authorization:"bearer "+JSON.parse(localStorage.getItem("token"))}
        })
        prods = await prods.json()
        setProducts(prods)
        console.log(prods)
    }

    const deleteProduct = async (id) => {
        let del = await fetch("http://localhost:5000/product/"+id,{
            method:"delete",
            headers:{authorization:"bearer "+JSON.parse(localStorage.getItem("token"))}
        })
        del = await del.json()
        console.log(del)
        loadProducts()
    }
    useEffect(()=>{
        loadProducts()
    },[])
    let index=0
    const searchHandle = async (event)=>{
        if(event.target.value===""){
            loadProducts()
        }
        let result = await fetch("http://localhost:5000/search/"+event.target.value,{
            method:"get",
            headers:{authorization:"bearer "+JSON.parse(localStorage.getItem("token"))}
        })
        result = await result.json()
        if(result){
            setProducts(result)
        }
        else{
            setProducts([])
        }
    }

    return (
        <div>
            <h1>Products</h1>
            <input type="text" className="search-box" placeholder="Search Product" onChange={searchHandle}/>
            <ul className="product-list"><li>Index</li><li>Name</li><li>Price</li><li>Category</li><li>Company</li><li>Operation</li></ul>
            {products.length > 0 ? products.map((prod)=><ul key={prod} className="product-list">
                <li>{index+=1}</li>
                <li>{prod.name}</li>
                <li>{prod.price}</li>
                <li>{prod.category}</li>
                <li>{prod.company}</li>
                <li><button className="delete-prod-btn" onClick={()=>deleteProduct(prod._id)} type="button">Delete</button>
                <Link to={"/update/"+prod._id}>Update</Link></li></ul>):<p>No Results Found</p>}
        </div>
    )
}
```

UpdateProduct.js:
```
const UpdateProduct = () => {
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [category,setCategory] = useState("")
    const [company,setCompany] = useState("")
    const [error,setError] = useState(false)
    const params = useParams()
    const navigate = useNavigate()

    const setProduct = async ()=>{
        let result = await fetch("http://localhost:5000/product/"+params.id,{
            method:"get",
            headers:{authorization:"bearer "+JSON.parse(localStorage.getItem("token"))}
        })
        result = await result.json()
        setName(result.name)
        setPrice(result.price)
        setCategory(result.category)
        setCompany(result.company)
    }

    const updateProduct = async ()=> {
        if(!name || !price || !category || !company){
            setError(true)
            return 
        }
        let result = await fetch("http://localhost:5000/product/"+params.id,{
            method:"put",
            body:JSON.stringify({name,price,category,company}),
            headers:{"Content-Type":"Application/json",
                authorization:"bearer "+JSON.parse(localStorage.getItem("token"))
            }
        })
        
        result = await result.json()
        console.log(result)
        alert("Product Updated")
        navigate("/")
    }

    useEffect(()=>{
        setProduct()
    },[])
    return (
        <div className="product">
            <h1>Update Product</h1>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="input-box" type="text" placeholder="Enter product name"/>
            {error && !name && <span style={{color:"red",marginTop:"-10px",marginLeft:"-200px"}}>Enter valid name</span>}
            <input value={price} onChange={(e)=>setPrice(e.target.value)} className="input-box" type="text" placeholder="Enter product price"/>
            {error && !price && <span style={{color:"red",marginTop:"-10px",marginLeft:"-200px"}}>Enter valid price</span>}
            <input value={category} onChange={(e)=>setCategory(e.target.value)} className="input-box" type="text" placeholder="Enter product category"/>
            {error && !category && <span style={{color:"red",marginTop:"-10px",marginLeft:"-180px"}}>Enter valid category</span>}
            <input value={company} onChange={(e)=>setCompany(e.target.value)} className="input-box" type="text" placeholder="Enter product company"/>
            {error && !company && <span style={{color:"red",marginTop:"-10px",marginLeft:"-170px"}}>Enter valid company</span>}
            <button onClick={()=>updateProduct()} className="signup-btn" type="button">Update Product</button>
        </div>
    )
}
```

Profile.js:
```
import React,{useState} from "react"
import { useParams } from "react-router-dom"


const Profile = () => {
    const [name,setName]=useState(JSON.parse(localStorage.getItem("user")).name)
    const params = useParams()
    const updateProfile = async() => {
        if(name.length <= 0){
            return
        }
        console.log("http://localhost:5000/user/"+params.id)
        let result = await fetch("http://localhost:5000/user/"+params.id,{
            method:"put",
            body:JSON.stringify({name}),
            headers:{"Content-Type":"Application/json"}
        })
        let currUser = JSON.parse(localStorage.getItem("user"))
        currUser.name=name
        localStorage.setItem("user",JSON.stringify(currUser))
        result= await result.json()
        console.log(result)
        window.location.reload();
    }
    return (
        <div className="profile">
            <h1>Profile</h1>
            <div className="imgContainer"><p>Click to update</p></div>
            <input className="input-box" onChange={(e)=>setName(e.target.value)} type="text" placeholder="Enter Username" value={name}/>
            <button onClick={()=>updateProfile()} type="button" className="signup-btn">Submit Changes</button>
        </div>
    )
}
```
