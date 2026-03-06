"use client"
import { useState } from "react"

export default function Admin(){

const [title,setTitle]=useState("")
const [author,setAuthor]=useState("")
const [message,setMessage]=useState("")

const addBook = async ()=>{

const res = await fetch("/api/book",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
title,
author
})
})

const data = await res.json()

setMessage(data.message)

}

return(

<div style={{padding:"40px"}}>

<h1>Admin Panel</h1>

<input
placeholder="Book title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
/>

<br/>

<input
placeholder="Author"
value={author}
onChange={(e)=>setAuthor(e.target.value)}
/>

<br/>

<button onClick={addBook}>
Add Book
</button>

<p>{message}</p>

</div>

)

}