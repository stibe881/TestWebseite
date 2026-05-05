import { Composition } from "remotion";
import { Showcase, FPS, SCENE_FRAMES, SCENES } from "./Showcase";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Showcase"
      component={Showcase}
      durationInFrames={SCENE_FRAMES * SCENES.length}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
