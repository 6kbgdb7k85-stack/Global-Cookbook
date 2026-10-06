import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function useFetch(url, method = "GET", onLoad = true) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(onLoad){
      runFetch()
    }
  },[])

  function runFetch(body = {}) {
    if(url.includes('undefined')){
      return
    }
    const { urlParams = {}, searchParams = {}, ...payload } = body;
    fetch(compileUrl(urlParams, searchParams), compileOptions(payload))
      .then(async (r) => {
        if (r.status === 204) {
          return "item deleted successfully";
        }
        const data = await r.json();
        if (!r.ok) {
          const error = new Error("Server Error");
          error.data = data;
          throw error;
        }
        return data;
      })
      .then((data) => {
        setLoading(false);
        setResponse(data);
      })
      .catch((error) => {
        console.error(error.data)
        setLoading(false);
        setError(error.data);
      });
  }

  function compileOptions(payload) {
    const { method: bodyMethod, ...requestBody } = payload;
    const selectedMethod = bodyMethod || method;
    const params = {
      method: selectedMethod,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    };
    switch (selectedMethod) {
      case "GET":
      case "DELETE":
        return params;
      case "POST":
      case "PATCH":
        return {
          ...params,
          headers: {
            ...params.headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        };
      default:
        console.warn("Invalid config: attempting fetch with default config");
        return params;
    }
  }

  function compileUrl(urlParams, searchParams) {
    let compiledUrl = `${API_URL || ""}/gcb/${url}`;
    Object.entries(urlParams).forEach(([key, value]) => {
      compiledUrl = compiledUrl.replace(key, value);
    });
    const searchList = Object.entries(searchParams);
    if (searchList?.length > 0) {
      compiledUrl += "?";
      searchList.forEach((key, value) => {
        compiledUrl += `&${key}=${value}`;
      });
    }
    return compiledUrl;
  }

  return { response, setResponse, error, setError, loading, runFetch };
}
