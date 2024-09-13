import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async () => {
    try {
      const usersString = await AsyncStorage.getItem("users");
      const users = usersString ? JSON.parse(usersString) : [];

      const user = users.find(user => user.email === email && user.password === password);

      if (user) {
        await AsyncStorage.setItem("currentUser", email);
        navigation.navigate("AppTabs");
      } else {
        Alert.alert("Erro", "Email ou senha incorretos!");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao fazer login.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      const usersString = await AsyncStorage.getItem("users");
      const users = usersString ? JSON.parse(usersString) : [];

      const userIndex = users.findIndex(user => user.email === resetEmail);
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        await AsyncStorage.setItem("users", JSON.stringify(users));
        Alert.alert("Sucesso", "Senha atualizada com sucesso!");
        setIsModalVisible(false); 
      } else {
        Alert.alert("Erro", "Email não encontrado.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao redefinir a senha.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logomarca.png")} style={styles.logo} />
        </View>
        <Text style={styles.title}>Faça seu login</Text>
        <Text style={styles.welcomeMessage}>
          Entre e gerencie suas finanças de forma fácil e eficiente!
        </Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.forgotButtonText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Cadastro")}
        >
          <Text style={styles.registerButtonText}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>

      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Redefinir Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
              <Text style={styles.buttonText}>Atualizar senha</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 130,
    height: 130,
  },
  loginContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    borderColor: "#c2be99",
    borderWidth: 1,
    elevation: 5,
  },
  title: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#284767",
  },
  welcomeMessage: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
    color: "#376f7b",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: "#284767",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ceceb1",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#f4f4f4",
  },
  button: {
    backgroundColor: "#7ebab6",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 17,
  },
  registerButton: {
    marginTop: 20,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#7ebab6",
    fontSize: 12,
    fontWeight: "bold",
  },
  forgotButton: {
    alignItems: "flex-end",
  },
  forgotButtonText: {
    color: "#7ebab6",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#284767",
  },
  closeModalButton: {
    marginTop: 20,
  },
  closeModalButtonText: {
    color: "#7ebab6",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default LoginScreen;
