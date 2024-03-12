import "./style.css"
import { AppController } from "./appController";
import { serverMessage } from "../../../env/types";

let app = AppController.getInstance();
(window as any).controller = app;
(app as any).server.event$.subscribe((data:serverMessage)=>console.log(data))
