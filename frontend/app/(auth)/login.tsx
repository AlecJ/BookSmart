import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter both email and password");
			return;
		}

		setIsLoading(true);
		try {
			await login(email, password);
			// Navigation will be handled automatically by the auth check
			router.replace("/(tabs)");
		} catch (error: any) {
			Alert.alert("Login Failed", error.message || "Invalid credentials");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.form}>
				<Text style={styles.title}>Welcome to BookSmart</Text>
				<Text style={styles.subtitle}>Sign in to continue</Text>

				<TextInput
					style={styles.input}
					placeholder="Email"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
					autoComplete="email"
				/>

				<TextInput
					style={styles.input}
					placeholder="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					autoComplete="password"
				/>

				<TouchableOpacity
					style={[styles.button, isLoading && styles.buttonDisabled]}
					onPress={handleLogin}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.buttonText}>Sign In</Text>
					)}
				</TouchableOpacity>

				<Link href="/(auth)/register" asChild>
					<TouchableOpacity>
						<Text style={styles.linkText}>
							Don't have an account? Register here
						</Text>
					</TouchableOpacity>
				</Link>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		// flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f1e9d2",
		padding: 20,
	},
	form: {
		width: "100%",
		maxWidth: 400,
		backgroundColor: "#fff",
		padding: 30,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 8,
		textAlign: "center",
		color: "#333",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginBottom: 30,
		textAlign: "center",
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 15,
		marginBottom: 15,
		fontSize: 16,
		backgroundColor: "#f9f9f9",
	},
	button: {
		backgroundColor: "#4A90E2",
		height: 50,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	linkText: {
		color: "#4A90E2",
		textAlign: "center",
		marginTop: 20,
		fontSize: 14,
	},
});
