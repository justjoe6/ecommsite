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

export default Profile