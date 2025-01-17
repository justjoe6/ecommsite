import React,{useState} from "react"

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

export default AddProduct