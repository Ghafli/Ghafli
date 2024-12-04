import React from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Deck } from '../../lib/db/types';

interface DeckCardProps {
  deck: Deck;
  onClick?: (deckId: string) => void;
}

export default function DeckCard({ deck, onClick }: DeckCardProps) {
  const router = useRouter();
  const {
    id,
    title,
    description,
    totalCards = 0,
    cardsStudied = 0,
    lastStudied,
    mastery = 0
  } = deck;

  const progress = totalCards > 0 ? (cardsStudied / totalCards) * 100 : 0;
  const masteryPercentage = Math.round(mastery * 100);
  const lastStudiedDate = lastStudied ? new Date(lastStudied).toLocaleDateString() : 'Never';

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    } else {
      router.push(`/decks/${id}`);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 6
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {description || 'No description'}
          </Typography>

          <Box sx={{ mt: 'auto' }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                size="small"
                icon={<SchoolIcon />}
                label={`${totalCards} cards`}
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<StarIcon />}
                label={`${masteryPercentage}% mastery`}
                variant="outlined"
                color="primary"
              />
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ mb: 2, height: 6, borderRadius: 1 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon color="action" sx={{ fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                Last studied: {lastStudiedDate}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
