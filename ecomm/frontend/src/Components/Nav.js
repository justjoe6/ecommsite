import React from 'react'
import { Link,useNavigate } from 'react-router-dom'

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


export default Nav