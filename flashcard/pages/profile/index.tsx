import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Tab, 
  Tabs,
  Avatar,
  Divider
} from '@mui/material';
import ProfileForm from '@/components/profile/ProfileForm';
import SecuritySettings from '@/components/profile/SecuritySettings';
import PreferencesForm from '@/components/profile/PreferencesForm';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoadingScreen from '@/components/common/LoadingScreen';

const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              src={session.user?.image || ''}
              alt={session.user?.name || ''}
              sx={{ width: 80, height: 80, mr: 2 }}
            />
            <Box>
              <Typography variant="h4" component="h1">
                {session.user?.name}
              </Typography>
              <Typography color="textSecondary">
                {session.user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Profile" />
            <Tab label="Security" />
            <Tab label="Preferences" />
          </Tabs>

          {activeTab === 0 && (
            <ProfileForm 
              initialData={{
                name: session.user?.name || '',
                email: session.user?.email || '',
                image: session.user?.image || ''
              }}
            />
          )}
          {activeTab === 1 && <SecuritySettings />}
          {activeTab === 2 && <PreferencesForm />}
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default Profile;
