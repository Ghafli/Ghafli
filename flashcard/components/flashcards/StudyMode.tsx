import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  LinearProgress,
  Stack,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Flip as FlipIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
}

interface StudyModeProps {
  flashcards: Flashcard[];
  mode: 'learn' | 'quiz' | 'review';
  onComplete: (results: StudyResults) => void;
}

interface StudyResults {
  correctCount: number;
  incorrectCount: number;
  timeSpent: number;
}

export default function StudyMode({ flashcards, mode, onComplete }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState<StudyResults>({
    correctCount: 0,
    incorrectCount: 0,
    timeSpent: 0,
  });

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (correct?: boolean) => {
    if (mode !== 'learn' && correct !== undefined) {
      setResults(prev => ({
        ...prev,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        incorrectCount: prev.incorrectCount + (correct ? 0 : 1),
      }));
    }

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete({ ...results, timeSpent });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      <Card 
        sx={{ 
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          perspective: '1000px',
        }}
        onClick={handleFlip}
      >
        <CardContent 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            position: 'relative',
          }}
        >
          <Box sx={{ 
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 1,
          }}>
            <Chip 
              label={currentCard.deck}
              size="small"
              color="primary"
              variant="outlined"
            />
            {currentCard.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>

          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              textAlign: 'center',
              backfaceVisibility: 'hidden',
              display: isFlipped ? 'none' : 'block',
            }}
          >
            {currentCard.front}
          </Typography>

          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              textAlign: 'center',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              display: isFlipped ? 'block' : 'none',
            }}
          >
            {currentCard.back}
          </Typography>
        </CardContent>
      </Card>

      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="center" 
        alignItems="center"
        sx={{ mt: 3 }}
      >
        <IconButton 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowBackIcon />
        </IconButton>

        <IconButton onClick={handleFlip}>
          <FlipIcon />
        </IconButton>

        {mode === 'learn' ? (
          <Button
            variant="contained"
            onClick={() => handleNext()}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleNext(false)}
            >
              Incorrect
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleNext(true)}
            >
              Correct
            </Button>
          </Stack>
        )}

        <IconButton 
          onClick={() => handleNext()}
          disabled={currentIndex === flashcards.length - 1}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Stack>

      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
        sx={{ mt: 2 }}
      >
        Card {currentIndex + 1} of {flashcards.length}
      </Typography>
    </Box>
  );
}
