import { Button } from "../Button/Button";
import "./PlannerCalculateButton.scss";
import { Panel } from "../Panel/Panel";
import { Link } from "react-router-dom";

type PlannerCalculateButtonProps = {
  onCalculate: () => void;
  disabled: boolean;
  isLoading?: boolean;
  hasHarvestDate?: boolean;
};

export const PlannerCalculateButton = ({
  onCalculate,
  disabled,
  isLoading = false,
  hasHarvestDate = false,
}: PlannerCalculateButtonProps) => {
  return (
    <Panel title="Beräkna ditt sådatum">
      {!hasHarvestDate && (
        <>
          <p>Du har inte valt skördedatum ännu.</p>
          <p>
          <Link to="/planner" onClick={() => window.scrollTo(0, 0)}>
            Du väljer ditt skördedatum</Link> här i planeraren.
        </p>
        </>
      )}
      <Button
        type="button"
        variant="primary"
        className="planner-calculate-button"
        disabled={disabled || isLoading}
        onClick={onCalculate}
        aria-label={disabled ? "Välj ett giltigt skördedatum för att beräkna" : "Beräkna planen"}
      >
        {isLoading ? "Beräknar..." : "Beräkna ditt sådatum"}
      </Button>
    </Panel>
  );
};

