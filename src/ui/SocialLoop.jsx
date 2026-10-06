import LogoLoop from "../components/LogoLoop.jsx";
import { SOCIALS } from "../data/socials.js";
import SocialChip from "./SocialChip.jsx";

// The first copy is the one in the tab order; the repeats stay clickable but aren't tabbed through.
const renderSocial = (social, key, copyIndex) => <SocialChip social={social} size="loop" tabIndex={copyIndex > 0 ? -1 : undefined} />;

// React Bits' LogoLoop, carrying a card per channel (name and handle, not just a logo). It slows to
// a stop under the pointer so a card can be clicked, and fades out at both edges.
export default function SocialLoop({ speed = 46 }) {
  return (
    <LogoLoop
      logos={SOCIALS}
      renderItem={renderSocial}
      speed={speed}
      gap={16}
      logoHeight={16}
      hoverSpeed={0}
      fadeOut
      fadeOutColor="var(--loop-fade, var(--bg))"
      ariaLabel="Thermyx on social media"
      className="social-loop"
    />
  );
}
