import { Box, Button, ButtonGroup } from '@mui/material';
import { ThumbUp, ThumbDown, Lightbulb } from '@mui/icons-material';

interface StudyControlsProps {
  onCorrect: () => void;
  onIncorrect: () => void;
  showHint?: boolean;
  onShowHint?: () => void;
}

const StudyControls = ({ onCorrect, onIncorrect, showHint, onShowHint }: StudyControlsProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      <ButtonGroup variant="contained" size="large">
        <Button
          onClick={onIncorrect}
          color="error"
          startIcon={<ThumbDown />}
        >
          Incorrect
        </Button>
        {showHint && (
          <Button onClick={onShowHint} color="warning" startIcon={<Lightbulb />}>
            Hint
          </Button>
        )}
        <Button
          onClick={onCorrect}
          color="success"
          startIcon={<ThumbUp />}
        >
          Correct
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default StudyControls;
