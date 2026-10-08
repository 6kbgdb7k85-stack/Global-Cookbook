import { Alert } from "@mui/material";

export default function AlertWrapper({severity,message}){
    return <Alert severity={severity}>{message}</Alert>
}