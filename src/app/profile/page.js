"use client"
import { useEffect,useState } from "react"

export default function Profile(){

const [user,setUser]=useState(null)

useEffect(()=>{
fetchProfile()
},[])

const fetchProfile = async ()=>{

const res = await fetch("/api/user/profile")

if(res.ok){
const data = await res.json()
setUser(data)
}

}

if(!user){
return <p>Loading...</p>
}

return(

<div style={{padding:"40px"}}>

<h1>User Profile</h1>

<p>Email: {user.email}</p>
<p>Role: {user.role}</p>

</div>

)

}