import React,{useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom'


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

export default Signup