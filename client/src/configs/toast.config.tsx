import UserJoinedToastContent from "common/UserJoinedToastContent";
import UserRemovedToastContent from "common/UserRemovedToastContent";
import { Id, toast as toaster, ToastOptions } from "react-toastify";
import { PeerInfo } from "types/room.type";

const toast = toaster;

// @ts-ignore
toast.userJoined = <TData = unknown,>(
  props: PeerInfo,
  options?: ToastOptions<TData>
): Id => toaster(<UserJoinedToastContent {...props} />, { ...options });

// @ts-ignore
toast.userLeft = <TData = unknown,>(
  props: PeerInfo,
  options?: ToastOptions<TData>
): Id => toaster(<UserRemovedToastContent {...props} />, { ...options });

export default toast;
