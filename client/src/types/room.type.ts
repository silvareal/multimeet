export interface PeerInfo {
  id?: string;
  userAgent: string;
  channelPassword: string;
  peerName: string;
  peerGender: string;
  avatar: string;
  peerVideo: boolean;
  peerAudio: boolean;
  peerRaised_hand: boolean;
  peerScreenRecord: boolean;
  peerScreenShare: boolean;
}
