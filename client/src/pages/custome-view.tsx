import React from 'react'
import { useParams } from 'wouter'

export default function CustomerView(){
    const { id }= useParams()
  return (<>
    <div>CustomerView</div>
    <p>{id}</p>
  </>
  )
}
