import React,{useEffect,useState} from "react"
import { Link } from 'react-router-dom'

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


export default Products