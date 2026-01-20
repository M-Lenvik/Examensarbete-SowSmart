import { Panel } from "../components/Panel/Panel";
import { GrowingTipsList } from "../components/GrowingTipsList/GrowingTipsList";

export const GrowingTips = () => {
  return (
    <section>
      <h1>Odlingsråd</h1>
      <Panel title="Vad är egentligen avhärdning?">
        <p>
          Om du inte känner dig säker på vad som menas med ett uttryck kan du läsa på om de olika stegen i odlingsprocessen.
          Vi guidar dig genom olika uttryck som till exempel avhärdning.
        </p>
        <GrowingTipsList />
      </Panel>
    </section>
  );
};

