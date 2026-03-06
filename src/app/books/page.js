"use client"
import { useEffect,useState } from "react"

export default function Books(){

const [books,setBooks]=useState([])

useEffect(()=>{
fetchBooks()
},[])

const fetchBooks = async () => {

const res = await fetch("/api/book")

if(res.ok){
const data = await res.json()
setBooks(data)
}

}

const borrowBook = async(id)=>{

const res = await fetch("/api/borrow",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
bookId:id
})
})

const data = await res.json()

alert(data.message)

}

return(

<div style={{padding:"40px"}}>

<h1>Books</h1>

{books.map(book=>(
<div key={book._id} style={{border:"1px solid gray",padding:"10px",margin:"10px"}}>

<h3>{book.title}</h3>

<p>{book.author}</p>

<button onClick={()=>borrowBook(book._id)}>
Borrow
</button>

</div>
))}

</div>

)

}