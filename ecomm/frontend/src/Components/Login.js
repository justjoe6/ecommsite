import React,{useState,useEffect} from "react"
import { useNavigate } from "react-router-dom"

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

export default Login