import PostpilotChannels from "@/components/postpilot/PostpilotChannels";
import PostpilotCreators from "@/components/postpilot/PostpilotCreators";
import PostpilotHero from "@/components/postpilot/PostpilotHero";
import PostpilotHow from "@/components/postpilot/PostpilotHow";
import PostpilotJourney from "@/components/postpilot/PostpilotJourney";
import PostpilotMarketingShell from "@/components/postpilot/PostpilotMarketingShell";
import PostpilotPricing from "@/components/postpilot/PostpilotPricing";
import PostpilotTestimonials from "@/components/postpilot/PostpilotTestimonials";
import "./postpilot.css";

export default function Home() {
  return (
    <PostpilotMarketingShell>
      <PostpilotHero />
      <PostpilotChannels />
      <PostpilotHow />
      <PostpilotJourney />
      <PostpilotCreators />
      <PostpilotTestimonials />
      <PostpilotPricing />
    </PostpilotMarketingShell>
  );
}
