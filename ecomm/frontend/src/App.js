import Nav from './Components/Nav'
import Footer from './Components/Footer'
import Signup from './Components/Signup'
import PrivateComponent from './Components/PrivateComponent';
import Login from "./Components/Login"
import AddProduct from './Components/AddProduct';
import Products from "./Components/Products"
import UpdateProduct from './Components/UpdateProduct';
import Profile from './Components/Profile'
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom'

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

export default App;
