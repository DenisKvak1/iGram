import "./style.css";
import { AppController } from "./appController";
import { serverMessage } from "../../../env/types";
import { computed } from "../../../env/reactivity2.0/computed";
import { ReactiveList } from "../../../env/reactivity2.0/reactivityList";
import { registerReactivityList } from "../../../env/reactivity2.0/registerReactivityList";
import { server } from "./modules/Server";
import { emojiParser } from "./modules/EmojiParser";
import { EmojiPanel } from "./components/emojiPanel/emojiPanel";

let app = AppController.getInstance();
(window as any).EmojiPanel = EmojiPanel;
(window as any).emojiParser = emojiParser;
(window as any).ReactiveList = ReactiveList;
(window as any).reactivityList = registerReactivityList;

(window as any).controller = app;
(window as any).computed = computed;

server.event$.subscribe((data: serverMessage) => console.log(data));

