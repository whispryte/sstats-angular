import {Injectable} from '@angular/core';
import {forEach} from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {

  loaded : Set<string> = new Set<string>();

  constructor() {
  }

  async loadJsScript(path: string) {

    if(this.loaded.has(path)){
      return;
    }

    console.debug("injecting script: " + path);

    try{
      await loadScript(path);
      this.loaded.add(path);
    }catch(err){
      console.error("Не удалось внедрить скрипт " + path, err);
    }
  }

  /**
   * Load C3 chart scripts
   */
  async loadC3Scripts(){
    let scripts = [
      "/assets/js/d3/d3v5.min.js",
      "/assets/js/c3.min.js"
    ];

    await Promise.all(scripts.map(i=>this.loadJsScript(i)));
  }
}

const loadScript = (FILE_URL : any, async = true, type = "text/javascript") => {
  return new Promise((resolve, reject) => {
    try {
      const scriptEle = document.createElement("script");
      scriptEle.type = type;
      scriptEle.async = async;
      scriptEle.src =FILE_URL;

      scriptEle.addEventListener("load", (ev) => {
        resolve({ status: true });
      });

      scriptEle.addEventListener("error", (ev) => {
        reject({
          status: false,
          message: `Failed to load the script ${FILE_URL}`
        });
      });

      document.body.appendChild(scriptEle);
    } catch (error) {
      reject(error);
    }
  });
};
