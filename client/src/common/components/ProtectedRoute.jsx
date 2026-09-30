import { Outlet, useOutletContext } from "react-router";

export default function ProtectedRoute(){
    const appContext = useOutletContext()

    return(
        <Outlet context={{...appContext}}/>
    )
}