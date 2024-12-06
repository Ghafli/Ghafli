import { Card, CardContent, Typography, Box, SxProps, Theme } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sx?: SxProps<Theme>;
}

const StatsCard = ({ title, value, icon, trend, sx }: StatsCardProps) => {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 1, 
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
        </Box>

        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              color={trend.isPositive ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              vs last week
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
