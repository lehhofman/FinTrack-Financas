import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, TouchableOpacity, Modal, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from "@react-native-async-storage/async-storage";

import DashboardScreen from "./src/screens/DashboardScreen";
import TransactionsScreen from "./src/screens/TransactionsScreen";
import BudgetsScreen from "./src/screens/BudgetsScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AppTabs() {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    resetModal();
    setShowModal(false);
  };
  const handleDateChange = (text) => {
    const numbers = text.replace(/\D/g, "");
    let formattedDate = "";

    if (numbers.length <= 4) {
      formattedDate = numbers.match(/.{1,2}/g)?.join("/") || "";
    } else if (numbers.length <= 6) {
      formattedDate = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 6)}`;
    } else if (numbers.length > 6) {
      formattedDate = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }

    setDate(formattedDate);
  };

  const resetModal = () => {
    setDate('');
    setDescription('');
    setCategory('');
    setType('');
    setAmount('');
    setEditMode(false);
    setEditItem(null);
  };

  const saveTransaction = async () => {
    if (!date || !description || !category || !type || !amount) {
      alert("Preencha todos os campos!");
      return;
    }

    const newTransaction = {
      id: editMode ? editItem.id : transactions.length + 1,
      date,
      description,
      category,
      type,
      amount: parseFloat(amount),
    };

    try {
      const currentUser = await AsyncStorage.getItem("currentUser");
      if (currentUser) {
        let savedTransactions = await AsyncStorage.getItem(`transactions_${currentUser}`);
        savedTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];

        if (editMode) {
          const updatedTransactions = savedTransactions.map((transaction) =>
            transaction.id === editItem.id ? newTransaction : transaction
          );
          await AsyncStorage.setItem(`transactions_${currentUser}`, JSON.stringify(updatedTransactions));
          setTransactions(updatedTransactions);
        } else {
          savedTransactions.push(newTransaction);
          await AsyncStorage.setItem(`transactions_${currentUser}`, JSON.stringify(savedTransactions));
          setTransactions(savedTransactions);
        }
        closeModal();
      }
    } catch (error) {
      alert("Erro ao salvar transação");
    }
  };

  const handleEditTransaction = (item) => {
    setEditItem(item);
    setDate(item.date);
    setDescription(item.description);
    setCategory(item.category);
    setType(item.type);
    setAmount(item.amount.toString());
    setEditMode(true);
    openModal();
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Dashboard") {
              iconName = "home";
            } else if (route.name === "Transações") {
              iconName = "list";
            } else if (route.name === "Orçamentos") {
              iconName = "wallet";
            } else if (route.name === "Relatórios") {
              iconName = "analytics";
            }

            return (
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          },
          tabBarStyle: {
            backgroundColor: "#376f7b",
            height: 55,
          },
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "#ffffff",
          tabBarLabelStyle: {
            fontSize: 12,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen
          name="Transações"
          component={() => (
            <TransactionsScreen
              transactions={transactions}
              onEditTransaction={handleEditTransaction}
            />
          )}
        />
        <Tab.Screen
          name="Add"
          component={() => null}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openModal();
            },
          }}
          options={{
            tabBarIcon: ({ size }) => (
              <View style={styles.addButton}>
                <Ionicons name="add" size={size} color="#376f7b" />
              </View>
            ),
            tabBarLabel: () => null,
            tabBarButton: (props) => <TouchableOpacity {...props} style={styles.addTabButton} />,
          }}
        />
        <Tab.Screen name="Orçamentos" component={BudgetsScreen} />
        <Tab.Screen name="Relatórios" component={ReportsScreen} />
      </Tab.Navigator>

      <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editMode ? "Editar Transação" : "Adicionar Transação"}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Data (DD/MM/AAAA)"
              value={date}
              onChangeText={handleDateChange}
              maxLength={10}
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={description}
              onChangeText={setDescription}
            />
            <Picker selectedValue={category} style={styles.picker} onValueChange={(itemValue) => setCategory(itemValue)}>
            <Picker.Item label="Selecione a Categoria" value="" />
              <Picker.Item label="Alimentação" value="Alimentação" />
              <Picker.Item label="Renda Fixa" value="Renda Fixa" />
              <Picker.Item label="Combustivel" value="Combustivel" />
              <Picker.Item label="Transporte" value="Transporte" />
              <Picker.Item label="Moradia" value="Moradia" />
              <Picker.Item label="Lazer" value="Lazer" />
              <Picker.Item label="Educação" value="Educação" />
              <Picker.Item label="Saúde" value="Saúde" />
              <Picker.Item label="Utilidades" value="Utilidades" />
              <Picker.Item label="Viagens" value="Viagens" />
              <Picker.Item label="Eventos" value="Eventos" />
              <Picker.Item label="Presentes" value="Presentes" />
              <Picker.Item label="Cuidados Pessoais" value="Cuidados Pessoais" />
              <Picker.Item label="Assinaturas" value="Assinaturas" />
              <Picker.Item label="Impostos" value="Impostos" />
              <Picker.Item label="Seguros" value="Seguros" />
            </Picker>
            <Picker selectedValue={type} style={styles.picker} onValueChange={(itemValue) => setType(itemValue)}>
              <Picker.Item label="Renda" value="renda" />
              <Picker.Item label="Despesa" value="despesa" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveTransaction}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#284767",
  },
  closeButton: {
    backgroundColor: "#c2be99",
    borderRadius: 20,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#284767",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#d4af37",
    marginBottom: 10,
    padding: 8,
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
    backgroundColor: "white",
    borderColor: "transparent",
    borderWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#d4af37",
  },
  saveButton: {
    backgroundColor: "#376f7b",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    width: 43,
    height: 43,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    backgroundColor: "#ffff", 
  },
  addTabButton: {
    top: -1,
    marginHorizontal: 20,
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="Cadastro"
          component={RegisterScreen}
          options={{ title: "Cadastro" }}
        />
        <Stack.Screen
          name="AppTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}