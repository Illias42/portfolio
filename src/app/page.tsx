import { Capabilities } from "@/src/widgets/capabilities";
import { Contact } from "@/src/widgets/contact";
import { Experience } from "@/src/widgets/experience";
import { Hero } from "@/src/widgets/hero";
import { SelectedWork } from "@/src/widgets/selected-work";

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
