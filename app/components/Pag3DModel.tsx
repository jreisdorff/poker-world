import React, { createRef, useEffect, useState } from "react";
import { loader } from "~/root";
import Loader from "./LoaderCmp";
import TopMenu from "./TopMenuCmp";
import "./../routes/index.css";

enum BotStatus {
  IDLE = "idle",
  RUN = "run",
  WALK = "walk",
  JUMP = "jump",
}

export default function Pag3DModel() {
  const [botStatus, setBotStatus] = useState(BotStatus.IDLE);
  const [hidden, setHidden] = useState(false);

  let loaderRef = createRef<Loader>();
  let botRef = createRef<AFrame.Entity>();
  // Delay between bot animation transitions in seconds. For example: walk -> run
  const crossFadeDuration = 0.5;

  const orbitControls = {
    autoRotate: true,
    target: "#bot",
    enableDamping: true,
    dampingFactor: 0.1,
    rotateSpeed: 0.1,
    autoRotateSpeed: 0.15,
    zoomSpeed: 0.5,
    minDistance: 0,
    maxDistance: 100,
    invertZoom: true,
  };

  console.log(botRef);
  console.log(botRef.current);

  useEffect(() => {
    console.log(loaderRef);
    console.log(botRef);
    if (loaderRef && loaderRef.current && botRef && botRef.current && !hidden) {
        loaderRef.current.hide();
        setHidden(true);
    }
  });

  const onClickBtnRun = () => {
    setBotStatus(BotStatus.RUN);
  };

  const onClickBtnIdle = () => {
    setBotStatus(BotStatus.IDLE);
  };

  const onClickBtnWalk = () => {
    setBotStatus(BotStatus.WALK);
  };

  const onClickBtnJump = () => {
    setBotStatus(BotStatus.JUMP);
  };

  return (
    <div>
      <Loader ref={loaderRef}>Loading</Loader>

      <TopMenu onClickMenuBtn={() => {}}>
          <a id="btnIdle" onClick={ onClickBtnWalk } className="top-menu-item">Walk</a>
          <a id="btnRun" onClick={ onClickBtnRun } className="top-menu-item">Run</a>
          <a id="btnIdle" onClick={ onClickBtnJump } className="top-menu-item">Jump</a>
          <a id="btnIdle" onClick={ onClickBtnIdle } className="top-menu-item">Stop</a>
        </TopMenu>

      <a-scene>
        <a-assets>
          <img id="sky" src="img/square.jpg" />
          <a-asset-item
            id="pokermodel"
            src="assets/3d-model.gltf"
          ></a-asset-item>
        </a-assets>

        <a-gltf-model src="#pokermodel"></a-gltf-model>

        <a-sky src="#sky" rotation="0 -90 0" />

        <a-entity position="0 1 0">
            <a-entity position="0 -0.5 1.25" camera="near: 0.5; fov: 100"
            orbit-controls={ AFRAME.utils.styleParser.stringify(orbitControls) }/>
          </a-entity>

        <a-entity
          id="bot"
          ref={botRef}
          scale="1 1 1"
          position="0 0 0"
          animationMixer={`clip: ${botStatus}; crossFadeDuration: ${crossFadeDuration}`}
          json-model="src: #pokermodel"
        ></a-entity>

        <a-plane
          height="100"
          width="33"
          color="#4d672b"
          rotation="-90 0 0"
        ></a-plane>
      </a-scene>
    </div>
  );
}
