import UserJoinedToastContent from "common/UserJoinedToastContent";
import { Id, toast as toaster, ToastOptions } from "react-toastify";
import { PeerInfo } from "types/room.type";

const toast = toaster;

// @ts-ignore
toast.userJoined = <TData = unknown,>(
  props: PeerInfo,
  options?: ToastOptions<TData>
): Id => toaster(<UserJoinedToastContent {...props} />, { ...options });

export default toast;
