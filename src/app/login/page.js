"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {

const [email,setEmail]=useState("")
const [password,setPassword]=useState("")
const [message,setMessage]=useState("")
const router = useRouter()

const login = async () => {

const res = await fetch("/api/user/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({email,password})
})

const data = await res.json()

if(res.ok){
setMessage("Login success")
router.push("/books")
}
else{
setMessage(data.message)
}

}

return(
<div style={{padding:"40px"}}>

<h1>Library Login</h1>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<br/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<br/>

<button onClick={login}>
Login
</button>

<p>{message}</p>

</div>
)
}