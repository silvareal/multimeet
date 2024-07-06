// import { toast } from "react-toastify";
import { toast } from "configs/toast.config";

declare global {
  declare namespace toast {
    export function userJoined(value: any): any;
  }
}

declare namespace toast {
  export function userJoined(value: any): any;
}

export { toast };
