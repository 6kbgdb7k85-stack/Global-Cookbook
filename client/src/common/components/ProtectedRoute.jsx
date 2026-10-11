import { Outlet, useNavigate, useOutletContext } from "react-router";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const appContext = useOutletContext();
  const { session, setUser, sessionError, sessionLoading, getSession } = appContext;

  const navigate = useNavigate();

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (session) {
      setUser(session);
    }
  }, [session]);

  useEffect(() => {
    if (sessionError) {
      setUser(null);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [sessionError]);

  if (sessionLoading) {
    return <>Loading</>;
  }

  return <Outlet context={{ ...appContext }} />;
}
