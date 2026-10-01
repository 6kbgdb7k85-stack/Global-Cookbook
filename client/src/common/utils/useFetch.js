import { useState } from "react";

export default function useFetch(url,method='GET',onLoad=true){
    const [response,setResponse]=useState(null)
    const [error,setError]=useState(null)
    const [loading,setLoading]=useState(false)

    function runFetch(params){
        console.log('runFetch called with params:',params)
    }

    return {response,setResponse,error,setError,loading, runFetch}
}