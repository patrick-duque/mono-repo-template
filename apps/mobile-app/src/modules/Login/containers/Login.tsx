import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { useSession } from 'utils/providers';

import { LoginFormSchema, type LoginFormValues } from '../dtos';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
  const { signIn } = useSession();
  const { mutate, isPending, error } = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email_address: '', password: '' },
  });

  const onSubmit = handleSubmit((values) =>
    mutate(values, { onSuccess: ({ data }) => signIn(data) }),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Sign in</Text>

      <Controller
        control={control}
        name="email_address"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Email address"
            style={styles.input}
            value={value}
          />
        )}
      />
      {errors.email_address ? (
        <Text style={styles.error}>{errors.email_address.message}</Text>
      ) : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            accessibilityLabel="Password"
            autoComplete="password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={value}
          />
        )}
      />
      {errors.password ? (
        <Text style={styles.error}>{errors.password.message}</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error.message}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={isPending}
        onPress={() => void onSubmit()}
        style={[styles.button, isPending && styles.buttonDisabled]}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { color: '#dc2626' },
  button: {
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default Login;
