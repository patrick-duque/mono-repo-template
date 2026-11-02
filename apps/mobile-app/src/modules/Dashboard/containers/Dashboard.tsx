import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiError } from 'utils/hooks/Api';
import { useSession } from 'utils/providers';

import { useGetProfile } from '../hooks/useGetProfile';

const Dashboard = () => {
  const { signOut } = useSession();
  const { data, error, isLoading } = useGetProfile();

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      void signOut();
    }
  }, [error, signOut]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  const user = data?.data;

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>
            Welcome, {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.muted}>{user.email_address}</Text>
          {user.role ? <Text style={styles.muted}>{user.role.name}</Text> : null}
        </>
      ) : (
        <Text style={styles.error}>
          {error?.message ?? 'Profile unavailable.'}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => void signOut()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: '600' },
  muted: { color: '#71717a' },
  error: { color: '#dc2626' },
  button: {
    alignItems: 'center',
    borderColor: '#d4d4d8',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 24,
    paddingVertical: 14,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
});

export default Dashboard;
