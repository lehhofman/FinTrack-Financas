import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker'; 

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("renda");
  const [date, setDate] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const currentUser = await AsyncStorage.getItem("currentUser");
        if (currentUser) {
          const savedTransactions = await AsyncStorage.getItem(`transactions_${currentUser}`);
          if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    };
    loadTransactions();
  }, []);

  const saveTransaction = async () => {
    if (!amount || !description || !category || !date) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const newTransaction = {
      id: transactions.length + 1,
      amount: parseFloat(amount),
      category,
      description,
      type,
      date,
    };

    try {
      const currentUser = await AsyncStorage.getItem("currentUser");
      if (currentUser) {
        let savedTransactions = await AsyncStorage.getItem(`transactions_${currentUser}`);
        savedTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        savedTransactions.push(newTransaction);
        await AsyncStorage.setItem(`transactions_${currentUser}`, JSON.stringify(savedTransactions));
        setTransactions(savedTransactions);
        resetModal();
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar a transação.");
    }
  };

  const handleEditTransaction = (item) => {
    setEditItem(item);
    setAmount(item.amount.toString());
    setDescription(item.description);
    setCategory(item.category);
    setDate(item.date);
    setType(item.type);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdateTransaction = async () => {
    if (!amount || !description || !category || !date) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const updatedTransaction = {
      ...editItem,
      amount: parseFloat(amount),
      category,
      description,
      type,
      date,
    };

    try {
      const currentUser = await AsyncStorage.getItem("currentUser");
      if (currentUser) {
        let savedTransactions = await AsyncStorage.getItem(`transactions_${currentUser}`);
        savedTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        const updatedTransactions = savedTransactions.map((item) =>
          item.id === editItem.id ? updatedTransaction : item
        );
        await AsyncStorage.setItem(`transactions_${currentUser}`, JSON.stringify(updatedTransactions));
        setTransactions(updatedTransactions);
        resetModal();
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao atualizar a transação.");
    }
  };

  const resetModal = () => {
    setEditItem(null);
    setEditMode(false);
    setShowModal(false);
    setAmount("");
    setDescription("");
    setCategory("");
    setDate("");
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

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <Text style={styles.transactionDate}>{item.date}</Text>
      <Text style={styles.transactionDescription}>
        {item.description} - {item.category}
      </Text>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.type === "renda" ? "#2aad40" : "#df4822" },
        ]}
      >
        {item.type === "renda"
          ? `+ R$ ${item.amount.toFixed(2)}`
          : `- R$ ${item.amount.toFixed(2)}`}
      </Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditTransaction(item)}
      >
        <Text style={styles.editButtonText}>✎</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditMode(false);
          setShowModal(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? "Editar Transação" : "Adicionar Nova Transação"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={resetModal}
              >
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

            <Picker
              selectedValue={type}
              style={styles.picker}
              onValueChange={(itemValue) => setType(itemValue)}
            >
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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={editMode ? handleUpdateTransaction : saveTransaction}
            >
              <Text style={styles.saveButtonText}>
                {editMode ? "Atualizar" : "Salvar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  transactionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#284767",
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d4af37",
    padding: 10,
    marginBottom: 10,
    marginLeft: 15,
    width: "90%",
    marginTop:5,
    elevation: 2,
  },
  transactionDate: {
    fontWeight: "bold",
    color: "#376f7b",
  },
  transactionDescription: {
    fontSize: 16,
    color: "#284767",
  },
  transactionCategory: {
    fontSize: 14,
    color: "#7ebab6",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  editButton: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#284767",
    borderRadius: 20,
    padding: 5,
  },
  editButtonText: {
    fontSize: 16,
    color: "#ffff",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: "#376f7b",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 30,
    color: "#fff",
  },
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
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TransactionsScreen;