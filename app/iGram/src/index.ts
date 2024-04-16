import "./style.css";
import { AppController } from "./appController";
import { serverMessage } from "../../../env/types";
import { server } from "./modules/Server";
import { computed } from "../../../env/reactivity2.0/computed";
import { ReactiveList } from "../../../env/reactivity2.0/reactivityList";
import { registerReactivityList } from "../../../env/reactivity2.0/registerReactivityList";

let app = AppController.getInstance();


(window as any).ReactiveList = ReactiveList;
(window as any).reactivityList = registerReactivityList;


(window as any).controller = app;
(window as any).computed = computed;

server.event$.subscribe((data: serverMessage) => console.log(data));

