import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';

export default function BudgetScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);

  const isFocused = useIsFocused(); 

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await AsyncStorage.getItem("currentUser");
      if (currentUser) {
        const savedBudgets = await AsyncStorage.getItem(`budgets_${currentUser}`);
        if (savedBudgets !== null) {
          setBudgets(JSON.parse(savedBudgets));
        }
        const savedTransactions = await AsyncStorage.getItem(`transactions_${currentUser}`);
        if (savedTransactions !== null) {
          setTransactions(JSON.parse(savedTransactions));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused, loadUserData]);

  useEffect(() => {
    const recalculateBudgets = async () => {
      const currentUser = await AsyncStorage.getItem("currentUser");
      if (currentUser) {
        const savedBudgets = await AsyncStorage.getItem(`budgets_${currentUser}`);
        if (savedBudgets !== null) {
          const updatedBudgets = JSON.parse(savedBudgets).map((budget) => {
            const spentAmount = transactions
              .filter((transaction) => transaction.category === budget.category)
              .reduce((acc, transaction) => acc + transaction.amount, 0);
            return {
              ...budget,
              spentAmount,
              isExceeded: spentAmount > budget.budgetAmount,
              percentageSpent: ((spentAmount / budget.budgetAmount) * 100).toFixed(2),
            };
          });
          setBudgets(updatedBudgets);
        }
      }
    };
    recalculateBudgets();
  }, [transactions]);

  const generateUniqueId = () => `${Date.now()}`;

  const handleAddBudget = async () => {
    if (category && budgetAmount) {
      const currentUser = await AsyncStorage.getItem("currentUser");
      if (currentUser) {
        const newBudget = {
          id: generateUniqueId(),
          category,
          budgetAmount: parseFloat(budgetAmount),
          spentAmount: 0,
          isExceeded: false,
          percentageSpent: "0.00",
        };

        const updatedBudgets = editingBudget
          ? budgets.map((budget) =>
              budget.id === editingBudget.id ? newBudget : budget
            )
          : [...budgets, newBudget];
        setBudgets(updatedBudgets);

        try {
          await AsyncStorage.setItem(`budgets_${currentUser}`, JSON.stringify(updatedBudgets));
        } catch (error) {
          console.error("Erro ao salvar orçamentos:", error);
        }

        setCategory("");
        setBudgetAmount("");
        setEditingBudget(null);
        setModalVisible(false);
      }
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  const handleDeleteBudget = async (id) => {
    const currentUser = await AsyncStorage.getItem("currentUser");
    if (currentUser) {
      const updatedBudgets = budgets.filter((budget) => budget.id !== id);
      setBudgets(updatedBudgets);

      try {
        await AsyncStorage.setItem(`budgets_${currentUser}`, JSON.stringify(updatedBudgets));
      } catch (error) {
        console.error("Erro ao excluir orçamento:", error);
      }
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setBudgetAmount(budget.budgetAmount.toString());
    setModalVisible(true);
  };

  const renderBudgetCard = ({ item }) => (
    <View style={[styles.budgetCard, item.isExceeded && styles.exceededCard]}>
      <Text style={styles.budgetCategory}>{item.category}</Text>
      <Text style={styles.budgetOrcado}>+ R${item.budgetAmount ? item.budgetAmount.toFixed(2) : '0.00'}</Text>
      <Text style={styles.budgetGasto}>- R${item.spentAmount ? item.spentAmount.toFixed(2) : '0.00'}</Text>
      {!item.isExceeded ? (
        <Text style={styles.dontExceedText}>Adequado</Text>
      ) : (
        <Text style={styles.exceededText}>Excedido</Text>
      )}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditBudget(item)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBudget(item.id)}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.budgetsContainer}>
          <Text style={styles.budgetsTitle}>Orçamentos:</Text>
          <FlatList
            data={budgets}
            renderItem={renderBudgetCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.budgetsGrid}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setCategory("");
          setBudgetAmount("");
          setEditingBudget(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingBudget ? "Editar Orçamento" : "Adicionar Orçamento"}
            </Text>
            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
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
            <TextInput
              style={styles.input}
              placeholder="Valor do Orçamento"
              keyboardType="numeric"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddBudget}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 10,
  },
  budgetsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#284767",
    marginBottom: 10,
  },
  budgetsContainer: {
    marginBottom: 20,
  },
  budgetsGrid: {
    justifyContent: "space-between",
  },
  budgetCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d4af37",
    padding: 10,
    margin: 5,
    flex: 1,
    maxWidth: "48%",
    justifyContent: "space-between",
  },
  exceededCard: {
    borderColor: "#df4822",
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#284767",
  },
  budgetDetails: {
    fontSize: 14,
    color: "#284767",
  },
  budgetOrcado: {
    color: "#2aad40",
  },
  budgetGasto: {
    color: "#df4822",
  },
  dontExceedText: {
    color: "green",
    fontWeight: "bold",
  },
  exceededText: {
    color: "red",
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#7ebab6",
    borderRadius: 5,
    padding: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#df4822",
    borderRadius: 5,
    padding: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#376f7b",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#df4822",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  input: {
    height: 40,
    borderColor: "#ceceb1",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#376f7b",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  percentageContainer: {
    marginBottom: 20,
  },
  percentageCard: {
    backgroundColor: "#a4d0d0",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    borderColor: "#d4af37",
    borderWidth: 2,
  },
  percentageCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#284767",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#df4822",
  },
  percentageText: {
    fontSize: 14,
    color: "#284767",
  },
});