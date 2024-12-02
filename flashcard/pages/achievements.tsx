import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  Grid,
} from '@mui/material';
import { useState } from 'react';
import AchievementsList from '../components/achievements/AchievementsList';
import AchievementNotification from '../components/achievements/AchievementNotification';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`achievements-tabpanel-${index}`}
      aria-labelledby={`achievements-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Achievements
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Achievements" />
          <Tab label="Completed" />
          <Tab label="In Progress" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <AchievementsList filter="all" />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <AchievementsList filter="completed" />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <AchievementsList filter="in-progress" />
      </TabPanel>

      <AchievementNotification />
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
