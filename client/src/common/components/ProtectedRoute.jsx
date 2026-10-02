import { Outlet, useNavigate, useOutletContext } from "react-router";
import useFetch from "../utils/useFetch";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const appContext = useOutletContext();

  const {
    response: session,
    loading: sessionLoading,
    error: sessionError
  } = useFetch("me");

  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      appContext.setUser(session);
    }
  }, [session]);

  useEffect(() => {
    if (sessionError) {
      appContext.setUser(null);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [sessionError]);

  if (sessionLoading) {
    return <>Loading</>;
  }

  return <Outlet context={{ ...appContext }} />;
}
