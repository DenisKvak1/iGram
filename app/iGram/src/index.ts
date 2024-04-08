import "./style.css"
import { AppController } from "./appController";
import { serverMessage } from "../../../env/types";
import { server } from "./modules/Server";

let app = AppController.getInstance();
(window as any).controller = app;
server.event$.subscribe((data:serverMessage)=>console.log(data))
