import { Capabilities } from "@/widgets/capabilities";
import { Contact } from "@/widgets/contact";
import { Experience } from "@/widgets/experience";
import { Hero } from "@/widgets/hero";
import { SelectedWork } from "@/widgets/selected-work";

export default function Home() {
  return (
    <main>
      <Hero />
      <SelectedWork />
      <Experience />
      <Capabilities />
      <Contact />
    </main>
  );
}
