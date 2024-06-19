import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const gsapTImeline = gsap.timeline();

  useGSAP(() => {
    gsapTImeline.from("#nav h3", {
      y: -50,
      opacity: 0,
      delay: 0.4,
      duration: 0.8,
      stagger: 0.3,
    });

    gsapTImeline.from("#main h1", {
      x: -500,
      opacity: 0,
      duration: 0.8,
      stagger: 0.4,
    });

    gsapTImeline.from(".join-input", {
      x: -500,
      opacity: 0,
      duration: 0.8,
      stagger: 0.4,
    });

    gsapTImeline.from("img", {
      x: 100,
      rotate: 45,
      opacity: 0,
      duration: 1,
      stagger: 1,
    });
  });

  return (
    <div id="main">
      <div id="nav">
        <h3>
          <span style={{ color: "#a9f901" }}>Multi</span>Meet
        </h3>
        <div id="nav-part2">
          <h3>contact</h3>
        </div>
      </div>

      <h1>Get Your</h1>
      <h1>Meeting</h1>
      <h1>More Effective</h1>

      <img
        id="img1"
        src="https://images.unsplash.com/photo-1637580688480-00c8722d8767?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="model"
      />
      <img
        id="img2"
        src="https://plus.unsplash.com/premium_photo-1661510453631-a8454019e47f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="model"
      />
      <img
        id="img3"
        src="https://images.unsplash.com/photo-1633113214698-485cdb2f56fd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="model"
      />

      <div className="join-input mt-10 mb-5">
        <div className="start-input-container">
          <input placeholder="hddyd-ijej" />
          <button>
            <Icon icon="pixelarticons:arrow-right" style={{ color: "black" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
