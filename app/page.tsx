import { personJsonLd } from "@/shared/lib";
import { JsonLd } from "@/shared/ui/json-ld";
import { Capabilities } from "@/widgets/capabilities";
import { Contact } from "@/widgets/contact";
import { Experience } from "@/widgets/experience";
import { Hero } from "@/widgets/hero";
import { SelectedWork } from "@/widgets/selected-work";

export default function Home() {
  return (
    <main>
      <JsonLd data={personJsonLd()} />
      <Hero />
      <SelectedWork />
      <Experience />
      <Capabilities />
      <Contact />
    </main>
  );
}
