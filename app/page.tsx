import PostpilotChannels from "@/components/postpilot/PostpilotChannels";
import PostpilotCreators from "@/components/postpilot/PostpilotCreators";
import PostpilotCta from "@/components/postpilot/PostpilotCta";
import PostpilotFooter from "@/components/postpilot/PostpilotFooter";
import PostpilotHero from "@/components/postpilot/PostpilotHero";
import PostpilotHow from "@/components/postpilot/PostpilotHow";
import PostpilotJourney from "@/components/postpilot/PostpilotJourney";
import PostpilotNav from "@/components/postpilot/PostpilotNav";
import PostpilotPricing from "@/components/postpilot/PostpilotPricing";
import PostpilotTestimonials from "@/components/postpilot/PostpilotTestimonials";
import "./postpilot.css";

export default function Home() {
  return (
    <div className="postpilot-root min-h-screen">
      <PostpilotNav />
      <PostpilotHero />
      <PostpilotChannels />
      <PostpilotHow />
      <PostpilotJourney />
      <PostpilotCreators />
      <PostpilotTestimonials />
      <PostpilotPricing />
      <PostpilotCta />
      <PostpilotFooter />
    </div>
  );
}
