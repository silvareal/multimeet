import { useEffect, useState } from "react";
import "./VoicePitch.css";

type VoicePitchProps = {
  audioTrack: MediaStreamTrack | null;
};

export default function VoicePitch({ audioTrack }: VoicePitchProps) {
  const [freqPercentage, setFreqPercentage] = useState(0);

  function captureStream(stream: MediaStream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const onFrame = () => {
      analyser.getByteFrequencyData(dataArray);
      const lastData = dataArray.at(1);
      const freqPercentage = Math.round(((lastData || 0) / 256) * 100);
      setFreqPercentage(freqPercentage);

      document.documentElement.style.setProperty(
        "--width",
        `${300 + freqPercentage / 2}px`
      );
      document.documentElement.style.setProperty(
        "--height",
        `${300 + freqPercentage / 2}px`
      );
      window.requestAnimationFrame(onFrame);
    };
    window.requestAnimationFrame(onFrame);
  }

  useEffect(() => {
    if (audioTrack) {
      const stream = new MediaStream([audioTrack]);

      captureStream(stream);
    }
  }, [audioTrack]);

  return (
    <div className="audio-level__container audio-level__container--active">
      <div className="audio-level__indicator__container">
        <div
          style={{ height: `${freqPercentage}%` }}
          className="audio-level__indicator"
        ></div>
        <div
          style={{ height: `${freqPercentage}%` }}
          className="audio-level__indicator"
        ></div>
        <div
          style={{ height: `${freqPercentage}%` }}
          className="audio-level__indicator"
        ></div>
      </div>
    </div>
  );
}
