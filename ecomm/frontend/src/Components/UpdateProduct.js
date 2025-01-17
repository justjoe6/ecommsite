import React,{useState,useEffect} from "react"
import {useParams,useNavigate} from "react-router-dom"

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

export default UpdateProduct 