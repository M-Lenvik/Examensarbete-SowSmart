import { Button } from "../Button/Button";
import "./PlannerCalculateButton.scss";
import { Panel } from "../Panel/Panel";

type PlannerCalculateButtonProps = {
  onCalculate: () => void;
  disabled: boolean;
  isLoading?: boolean;
};

export const PlannerCalculateButton = ({
  onCalculate,
  disabled,
  isLoading = false,
}: PlannerCalculateButtonProps) => {
  return (
    <Panel title="Beräkna ditt sådatum">
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

