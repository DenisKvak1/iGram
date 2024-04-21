import "./style.css";
import { AppController } from "./appController";
import { serverMessage } from "../../../env/types";
import { computed } from "../../../env/reactivity2.0/computed";
import { ReactiveList } from "../../../env/reactivity2.0/reactivityList";
import { registerReactivityList } from "../../../env/reactivity2.0/registerReactivityList";
import { server } from "./modules/Server";
import { messageParser } from "./components/messageBlock/messageParser";

let app = AppController.getInstance();

(window as any).messageParser = messageParser;

(window as any).ReactiveList = ReactiveList;
(window as any).reactivityList = registerReactivityList;

(window as any).controller = app;
(window as any).computed = computed;

server.event$.subscribe((data: serverMessage) => console.log(data));

