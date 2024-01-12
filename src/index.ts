import "./assets/styles/index.css";

import Database from "./database";
import MapManager from "./map";
import MenuHandler from "./menu";
import DiscussionHandler from "./discussion";
import { FormHandler } from "./form";
import { listCategories } from "./utils";
import {
  type MapFunctionAddUser,
  type DatabaseFuncionOpenDiscussion,
  type DatabaseFuncionStoreDiscussion,
  type DatabaseFunctionAddUser,
  type MapFunctionChangeGroup,
  type DiscussionViewHandler,
} from "./types";

class Main {
  private readonly map: MapManager;
  private readonly database: Database;
  private readonly form: FormHandler;
  private readonly menu: MenuHandler;
  private readonly discussion: DiscussionHandler;

  constructor() {
    // Create all classes with bindinds
    this.map = new MapManager();
    this.database = new Database(
      this.map.registerNewPerson.bind(this.map) as MapFunctionAddUser
    );
    this.discussion = new DiscussionHandler(
      this.database.openDiscussion.bind(
        this.database
      ) as DatabaseFuncionOpenDiscussion,
      this.database.storeDiscussion.bind(
        this.database
      ) as DatabaseFuncionStoreDiscussion
    );
    this.form = new FormHandler(
      this.database.addUser.bind(this.database) as DatabaseFunctionAddUser
    );
    this.menu = new MenuHandler(
      this.map.changeGroup.bind(this.map) as MapFunctionChangeGroup
    );

    this.map.setDiscussionViewHandler(
      this.discussion.openDiscussionView.bind(
        this.discussion
      ) as DiscussionViewHandler
    );
  }

  async init(): Promise<void> {
    this.map.initMap();
    await this.database.signIn();

    await this.database.initDB();
    this.map.changeGroup(listCategories[0]);
    this.form.initForm();
    this.menu.initMenuEvents();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const _main = new Main();
  _main
    .init()
    .then(() => {
      console.log("App initialized");
    })
    .catch((error) => {
      console.error("App initialization error:", error.message);
    });
});
