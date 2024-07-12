export function generateMeetingId(length = 8) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let meetingId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    meetingId += characters[randomIndex];
    if ((i + 1) % 4 === 0 && i !== length - 1) {
      meetingId += "-";
    }
  }
  return meetingId;
}

export function getGravatarUrl() {
  // seed=${id}
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?radius=0&glassesProbability=10&seed=${generateMeetingId()}`;
}
