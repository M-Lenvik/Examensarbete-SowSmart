import { Button } from "../../shared/Button/Button";
import "./PlannerCalculateButton.scss";
import { Panel } from "../../shared/Panel/Panel";
import { Link } from "react-router-dom";

type PlannerCalculateButtonProps = {
  onCalculate: () => void;
  disabled: boolean;
  isLoading?: boolean;
  hasHarvestDate?: boolean;
  disabledReason?: string | null;
};

export const PlannerCalculateButton = ({
  onCalculate,
  disabled,
  isLoading = false,
  hasHarvestDate = false,
  disabledReason = null,
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
      {disabled && disabledReason && (
        <p className="planner-calculate-button__disabled-reason" aria-label={disabledReason}>
          {disabledReason}
        </p>
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

