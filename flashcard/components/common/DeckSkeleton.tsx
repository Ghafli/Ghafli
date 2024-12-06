import { Card, CardContent, CardActions, Skeleton, Box } from '@mui/material';

const DeckSkeleton = () => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="rectangular" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="40%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="80%" height={20} />
      </CardContent>
      <CardActions>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="rectangular" width={80} height={36} />
        </Box>
      </CardActions>
    </Card>
  );
};

export const DeckListSkeleton = () => {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {[...Array(6)].map((_, index) => (
        <DeckSkeleton key={index} />
      ))}
    </Box>
  );
};

export default DeckSkeleton;
