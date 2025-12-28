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
    <section>
        <Panel title="Beräkna ditt sådatum">
            <div className="planner-calculate-button">
                <Button
                    type="button"
                    variant="primary"
                    disabled={disabled || isLoading}
                    onClick={onCalculate}
                    aria-label={disabled ? "Välj ett giltigt skördedatum för att beräkna" : "Beräkna planen"}
                    >
                    {isLoading ? "Beräknar..." : "Beräkna ditt sådatum"}
                </Button>
            </div>
        </Panel>
    </section>
  );
};

