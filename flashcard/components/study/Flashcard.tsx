import { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Zoom } from '@mui/material';
import { Refresh, Lightbulb } from '@mui/icons-material';

interface FlashcardProps {
  front: string;
  back: string;
  hint?: string;
}

const Flashcard = ({ front, back, hint }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false); // Reset hint when card is flipped
  };

  return (
    <Box
      sx={{
        perspective: '1000px',
        width: '100%',
        height: '300px',
        cursor: 'pointer',
      }}
      onClick={handleFlip}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Front */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardContent>
            <Typography variant="h4" component="div" align="center">
              {front}
            </Typography>
            {hint && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  color={showHint ? 'primary' : 'default'}
                >
                  <Lightbulb />
                </IconButton>
                <Zoom in={showHint}>
                  <Typography variant="body2" color="text.secondary">
                    Hint: {hint}
                  </Typography>
                </Zoom>
              </Box>
            )}
          </CardContent>
        </Box>

        {/* Back */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardContent>
            <Typography variant="h4" component="div" align="center">
              {back}
            </Typography>
          </CardContent>
        </Box>
      </Card>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <IconButton onClick={(e) => {
          e.stopPropagation();
          handleFlip();
        }}>
          <Refresh />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Flashcard;
